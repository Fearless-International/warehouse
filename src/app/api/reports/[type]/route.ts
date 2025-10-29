import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import Request from '@/lib/db/models/Request';
import Product from '@/lib/db/models/Product';
import Branch from '@/lib/db/models/Branch';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    
    if (!session || !['warehouse_manager', 'admin', 'hr'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'excel';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const period = searchParams.get('period') || 'All Time';
    const reportType = params.type;

    await connectDB();

    // Build date filter
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let data: any = {};

    switch (reportType) {
      case 'requests':
        data = await generateRequestsData(dateFilter, period);
        break;
      case 'product-demand':
        data = await generateProductDemandData(dateFilter, period);
        break;
      case 'branch-performance':
        data = await generateBranchPerformanceData(dateFilter, period);
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    if (format === 'pdf') {
      const pdf = generatePDF(data.rows, data.summary, reportType, period);
      const pdfBuffer = pdf.output('arraybuffer');
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf"`
        }
      });
    } else {
      return NextResponse.json({
        data: data.rows,
        summary: data.summary,
        filename: `${reportType}-report-${new Date().toISOString().split('T')[0]}.xlsx`
      });
    }

  } catch (error: any) {
    console.error('Report generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function generatePDF(data: any[], summary: any, reportType: string, period: string) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235); // Blue color
  doc.text(getReportTitle(reportType), 14, 20);
  
  // Period and date
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Period: ${period}`, 14, 28);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);
  
  // Line separator
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(14, 37, 196, 37);
  
  // Summary section
  if (summary) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Summary Statistics', 14, 45);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let yPos = 52;
    
    Object.entries(summary).forEach(([key, value]) => {
      doc.text(`${formatSummaryKey(key)}: ${value}`, 20, yPos);
      yPos += 6;
    });
    
    yPos += 5;
    
    // Generate table
    if (reportType === 'requests') {
      autoTable(doc, {
        startY: yPos,
        head: [['Request #', 'Branch', 'Date', 'Items', 'Status', 'Delivery']],
        body: data.map(row => [
          row['Request Number'],
          row['Branch'],
          new Date(row['Date Submitted']).toLocaleDateString(),
          row['Items Count'],
          row['Status'],
          row['Delivery Date'] !== 'N/A' ? new Date(row['Delivery Date']).toLocaleDateString() : 'N/A'
        ]),
        theme: 'striped',
        headStyles: { 
          fillColor: [37, 99, 235],
          fontStyle: 'bold',
          fontSize: 9
        },
        styles: { 
          fontSize: 8, 
          cellPadding: 3 
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        }
      });
    } else if (reportType === 'product-demand') {
      autoTable(doc, {
        startY: yPos,
        head: [['Product', 'Requests', 'Total Qty', 'Branches', 'Avg/Request']],
        body: data.map(row => [
          row['Product'],
          row['Total Requests'],
          row['Total Quantity'],
          row['Number of Branches'],
          row['Average per Request']
        ]),
        theme: 'striped',
        headStyles: { 
          fillColor: [16, 185, 129],
          fontStyle: 'bold',
          fontSize: 9
        },
        styles: { 
          fontSize: 9, 
          cellPadding: 4 
        },
        alternateRowStyles: {
          fillColor: [240, 253, 244]
        }
      });
    } else if (reportType === 'branch-performance') {
      autoTable(doc, {
        startY: yPos,
        head: [['Branch', 'Total', 'Approved', 'Rejected', 'Partial', 'Pending', 'Rate']],
        body: data.map(row => [
          row['Branch'],
          row['Total Requests'],
          row['Approved'],
          row['Rejected'],
          row['Partially Approved'] || 0,
          row['Pending'],
          row['Approval Rate']
        ]),
        theme: 'striped',
        headStyles: { 
          fillColor: [139, 92, 246],
          fontStyle: 'bold',
          fontSize: 9
        },
        styles: { 
          fontSize: 9, 
          cellPadding: 4 
        },
        alternateRowStyles: {
          fillColor: [250, 245, 255]
        }
      });
    }
  }
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} | © ${new Date().getFullYear()} Warehouse Management System`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  return doc;
}

function formatSummaryKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function getReportTitle(reportType: string): string {
  switch (reportType) {
    case 'requests':
      return 'All Requests Report';
    case 'product-demand':
      return 'Product Demand Analysis';
    case 'branch-performance':
      return 'Branch Performance Report';
    default:
      return 'Warehouse Report';
  }
}

async function generateRequestsData(dateFilter: any, period: string) {
  const requests = await Request.find(dateFilter)
    .populate('branchId')
    .populate('requestedBy')
    .populate('reviewedBy')
    .sort({ createdAt: -1 })
    .lean();

  const summary = {
    totalRequests: requests.length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    partiallyApproved: requests.filter(r => r.status === 'partially_approved').length,
    pending: requests.filter(r => r.status === 'pending').length,
    approvalRate: requests.length > 0 
      ? `${Math.round(((requests.filter(r => r.status === 'approved' || r.status === 'partially_approved').length) / requests.length) * 100)}%`
      : '0%'
  };

  const rows = requests.map(req => ({
    'Request Number': req.requestNumber,
    'Branch': req.branchId?.name || 'N/A',
    'Requested By': req.requestedBy?.name || 'N/A',
    'Date Submitted': req.createdAt,
    'Items Count': req.items?.length || 0,
    'Status': req.status.toUpperCase(),
    'Delivery Date': req.deliveryDate || 'N/A',
    'Reviewed By': req.reviewedBy?.name || 'N/A',
    'Reviewed Date': req.reviewedAt || 'N/A',
    'Remarks': req.generalRemarks || req.remarks || 'N/A'
  }));

  return { rows, summary };
}

async function generateProductDemandData(dateFilter: any, period: string) {
  const matchStage = Object.keys(dateFilter).length > 0 ? { $match: dateFilter } : { $match: {} };

  const data = await Request.aggregate([
    matchStage,
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        totalRequests: { $sum: 1 },
        totalQuantity: { $sum: '$items.requestedQuantity' },
        branches: { $addToSet: '$branchId' }
      }
    },
    { $sort: { totalQuantity: -1 } }
  ]);

  const productsWithNames = await Promise.all(
    data.map(async (item: any) => {
      const product = await Product.findById(item._id).lean();
      return {
        'Product': product?.name || 'Unknown',
        'Total Requests': item.totalRequests,
        'Total Quantity': item.totalQuantity,
        'Number of Branches': item.branches.length,
        'Average per Request': Math.round(item.totalQuantity / item.totalRequests),
        'Period': period
      };
    })
  );

  const summary = {
    totalProducts: productsWithNames.length,
    totalQuantityRequested: productsWithNames.reduce((sum, p) => sum + p['Total Quantity'], 0),
    totalRequests: productsWithNames.reduce((sum, p) => sum + p['Total Requests'], 0),
    averageQuantityPerProduct: productsWithNames.length > 0 
      ? Math.round(productsWithNames.reduce((sum, p) => sum + p['Total Quantity'], 0) / productsWithNames.length)
      : 0
  };

  return { rows: productsWithNames, summary };
}

async function generateBranchPerformanceData(dateFilter: any, period: string) {
  const matchStage = Object.keys(dateFilter).length > 0 ? { $match: dateFilter } : { $match: {} };

  const branchPerformance = await Request.aggregate([
    matchStage,
    {
      $group: {
        _id: '$branchId',
        totalRequests: { $sum: 1 },
        approvedRequests: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        partiallyApprovedRequests: {
          $sum: { $cond: [{ $eq: ['$status', 'partially_approved'] }, 1, 0] }
        },
        rejectedRequests: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
        },
        pendingRequests: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        }
      }
    },
    {
      $addFields: {
        approvalRate: {
          $multiply: [
            { 
              $divide: [
                { $add: ['$approvedRequests', '$partiallyApprovedRequests'] },
                '$totalRequests'
              ] 
            },
            100
          ]
        }
      }
    },
    { $sort: { totalRequests: -1 } }
  ]);

  const branchesWithNames = await Promise.all(
    branchPerformance.map(async (item: any) => {
      const branch = await Branch.findById(item._id).lean();
      return {
        'Branch': branch?.name || 'Unknown',
        'Total Requests': item.totalRequests,
        'Approved': item.approvedRequests,
        'Partially Approved': item.partiallyApprovedRequests,
        'Rejected': item.rejectedRequests,
        'Pending': item.pendingRequests,
        'Approval Rate': `${Math.round(item.approvalRate)}%`
      };
    })
  );

  const summary = {
    totalBranches: branchesWithNames.length,
    totalRequests: branchesWithNames.reduce((sum, b) => sum + b['Total Requests'], 0),
    totalApproved: branchesWithNames.reduce((sum, b) => sum + b['Approved'], 0),
    totalRejected: branchesWithNames.reduce((sum, b) => sum + b['Rejected'], 0),
    overallApprovalRate: branchesWithNames.length > 0
      ? `${Math.round((branchesWithNames.reduce((sum, b) => sum + b['Approved'], 0) / branchesWithNames.reduce((sum, b) => sum + b['Total Requests'], 0)) * 100)}%`
      : '0%'
  };

  return { rows: branchesWithNames, summary };
}