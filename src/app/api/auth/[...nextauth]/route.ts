import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import Branch from "@/lib/db/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials');
            return null;
          }

          await connectDB();
          
          const user = await User.findOne({ 
            email: credentials.email,
            isActive: true 
          }).populate('branchId');
          
          if (!user) {
            console.log('User not found:', credentials.email);
            return null;
          }
          
          const isValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isValid) {
            console.log('Invalid password for:', credentials.email);
            return null;
          }
          
          console.log('Login successful:', credentials.email);
          
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            branchId: user.branchId?._id?.toString(),
            branchName: user.branchId?.name
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.branchId = user.branchId;
        token.branchName = user.branchName;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.branchId = token.branchId as string;
        session.user.branchName = token.branchName as string;
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  debug: true
};

// ✅ Add trustHost after the object definition
(authOptions as any).trustHost = true;

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };