/**
 * This file contains common types that need to be used across the frontend
 */

export interface Query {
  queryString: string,
  queryData: Record<string, any>[],
  queryStatistics: any,
  queryCurrentSchema: string,
  queryLabel: string
}