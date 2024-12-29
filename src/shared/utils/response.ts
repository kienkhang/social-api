import { Paginated } from "@/shared/interface";
import { Context } from "elysia";

const successResponse = (data: any, ctx: Context) => {
  ctx.set.status = 200;
  return { data };
};

const paginatedResponse = (paginated: Paginated<any>, ctx: Context) => {
  ctx.set.status = 200;
  return { data: paginated };
};

export { paginatedResponse, successResponse };
