// import { queryAllPosts } from "@/utils/post-server";
// import { NextRequest } from "next/server";

// function getNumberParam(
//   searchParams: URLSearchParams,
//   key: string,
//   defaultValue?: number,
// ) {
//   const value = searchParams.get(key);
//   if (value === null) return defaultValue;
//   const num = Number(value);
//   return Number.isNaN(num) ? defaultValue : num;
// }

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const limit = getNumberParam(searchParams, "limit", 1);
//   const page = getNumberParam(searchParams, "page", 1);
//   const query = await queryAllPosts({ limit, page });
//   return Response.json({
//     data: query.docs,
//     page: query.page,
//     nextPage: query.nextPage,
//   });
// }
