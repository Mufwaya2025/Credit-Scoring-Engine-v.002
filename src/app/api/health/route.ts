import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    status: "healthy",
    service: "ARC Credit Engine Pro",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: "ARC Credit Engine Pro is running smoothly"
  });
}