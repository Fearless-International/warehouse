import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      branchId?: string;
      branchName?: string;
    }
  }
  
  interface User {
    id: string;
    role: string;
    branchId?: string;
    branchName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    branchId?: string;
    branchName?: string;
  }
}