import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import License from "@/lib/db/models/License";
import { verifyLicenseSignature } from "@/lib/utils/licenseGenerator";

export async function POST(req: NextRequest) {
  try {
    const { licenseKey } = await req.json();

    await connectDB();
    const license = await License.findOne({ licenseKey });

    if (!license) {
      return NextResponse.json({ valid: false, error: "License not found" });
    }

    // Verify signature again
    if (!verifyLicenseSignature(license, license.signature)) {
      return NextResponse.json({ valid: false, error: "License tampered" });
    }

    // Check expiration
    if (license.expiryDate && new Date() > new Date(license.expiryDate)) {
      return NextResponse.json({ valid: false, error: "License expired" });
    }

    // Check suspension
    if (license.status === "suspended") {
      return NextResponse.json({ valid: false, error: "License suspended" });
    }

    // Update last validation timestamp
    license.lastValidated = new Date();
    await license.save();

    return NextResponse.json({ valid: true });

  } catch (error) {
    return NextResponse.json({ valid: false, error: "Validation failed" });
  }
}
