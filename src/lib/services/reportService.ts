import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export function generateRequestsReport(requests: any[], format: 'pdf' | 'excel') {
  if (format === 'pdf') {
    return generateRequestsPDF(requests);
  } else {
    return generateRequestsExcel(requests);
  }
}

function generateRequestsPDF(requests: any[]) {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text('Warehouse Requests Report', 14, 20);
  
  // Date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  
  // Summary Stats
  const approved = requests.filter(r => r.status === 'approved').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;
  const pending = requests.filter(r => r.status === 'pending').length;
  
  doc.setFontSize(12);
  doc.text(`Total Requests: ${requests.length}`, 14, 40);
  doc.text(`Approved: ${approved} | Rejected: ${rejected} | Pending: ${pending}`, 14, 47);
  
  // Table
  const tableData = requests.map(req => [
    req.requestNumber,
    req.branchName || 'N/A',
    new Date(req.createdAt).toLocaleDateString(),
    req.items?.length || 0,
    req.status,
    req.deliveryDate ? new Date(req.deliveryDate).toLocaleDateString() : 'N/A'
  ]);
  
  autoTable(doc, {
    startY: 55,
    head: [['Request #', 'Branch', 'Date', 'Items', 'Status', 'Delivery']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 9 }
  });
  
  return doc;
}

function generateRequestsExcel(requests: any[]) {
  const data = requests.map(req => ({
    'Request Number': req.requestNumber,
    'Branch': req.branchName || 'N/A',
    'Date Submitted': new Date(req.createdAt).toLocaleString(),
    'Items Count': req.items?.length || 0,
    'Status': req.status,
    'Delivery Date': req.deliveryDate ? new Date(req.deliveryDate).toLocaleDateString() : 'N/A',
    'Reviewed By': req.reviewedBy || 'N/A',
    'Remarks': req.remarks || 'N/A'
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Requests');
  
  return workbook;
}

export function generateProductDemandReport(products: any[], format: 'pdf' | 'excel', timeframe: string) {
  if (format === 'pdf') {
    return generateProductDemandPDF(products, timeframe);
  } else {
    return generateProductDemandExcel(products, timeframe);
  }
}

function generateProductDemandPDF(products: any[], timeframe: string) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Product Demand Report', 14, 20);
  
  doc.setFontSize(10);
  doc.text(`Period: ${timeframe}`, 14, 30);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 37);
  
  const totalQuantity = products.reduce((sum, p) => sum + p.totalQuantity, 0);
  const totalRequests = products.reduce((sum, p) => sum + p.totalRequests, 0);
  
  doc.setFontSize(12);
  doc.text(`Total Products: ${products.length}`, 14, 47);
  doc.text(`Total Quantity Requested: ${totalQuantity}`, 14, 54);
  doc.text(`Total Requests: ${totalRequests}`, 14, 61);
  
  const tableData = products.map(prod => [
    prod.product,
    prod.totalRequests,
    prod.totalQuantity,
    prod.branches?.length || 0,
    Math.round(prod.totalQuantity / prod.totalRequests)
  ]);
  
  autoTable(doc, {
    startY: 70,
    head: [['Product', 'Requests', 'Total Qty', 'Branches', 'Avg/Request']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] }
  });
  
  return doc;
}

function generateProductDemandExcel(products: any[], timeframe: string) {
  const data = products.map(prod => ({
    'Product': prod.product,
    'Total Requests': prod.totalRequests,
    'Total Quantity': prod.totalQuantity,
    'Number of Branches': prod.branches?.length || 0,
    'Average per Request': Math.round(prod.totalQuantity / prod.totalRequests),
    'Period': timeframe
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Product Demand');
  
  return workbook;
}

export function generateBranchPerformanceReport(branches: any[], format: 'pdf' | 'excel') {
  if (format === 'pdf') {
    return generateBranchPerformancePDF(branches);
  } else {
    return generateBranchPerformanceExcel(branches);
  }
}

function generateBranchPerformancePDF(branches: any[]) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Branch Performance Report', 14, 20);
  
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  
  const tableData = branches.map(branch => [
    branch.branch,
    branch.requests,
    branch.approved,
    `${branch.approvalRate}%`
  ]);
  
  autoTable(doc, {
    startY: 40,
    head: [['Branch', 'Total Requests', 'Approved', 'Approval Rate']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [139, 92, 246] }
  });
  
  return doc;
}

function generateBranchPerformanceExcel(branches: any[]) {
  const data = branches.map(branch => ({
    'Branch': branch.branch,
    'Total Requests': branch.requests,
    'Approved': branch.approved,
    'Approval Rate': `${branch.approvalRate}%`
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Branch Performance');
  
  return workbook;
}