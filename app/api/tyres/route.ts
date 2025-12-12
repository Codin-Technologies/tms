import { NextRequest } from "next/server";
import { getTyres } from "./get";
import { postTyre } from "./post";

export async function GET() {
  return getTyres();
}

export async function POST(request: NextRequest){
    return postTyre(request)
}
