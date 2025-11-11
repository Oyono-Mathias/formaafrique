import { NextResponse } from "next/server";

export function middleware() {
  // Désactivation des redirections pour test
  return NextResponse.next();
}
