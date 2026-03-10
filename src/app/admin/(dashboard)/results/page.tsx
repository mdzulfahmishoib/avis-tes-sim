import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

import { ResultsFilters } from "./results-filters"

export default async function AdminResultsPage(props: {
  searchParams: Promise<{ 
    page?: string;
    search?: string;
    sim_type?: string;
    status?: string;
  }>
}) {
  const searchParams = await props.searchParams
  const page = parseInt(searchParams.page || "1")
  const search = searchParams.search || ""
  const simType = searchParams.sim_type || ""
  const status = searchParams.status || ""
  const pageSize = 15
  const supabase = await createClient()

  // Fetch results with count for pagination
  let query = supabase
    .from('test_results')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  // Apply filters
  if (search) {
    query = query.or(`participant_name.ilike.%${search}%,participant_email.ilike.%${search}%`)
  }
  if (simType && simType !== 'all') {
    query = query.eq('sim_type', simType)
  }
  if (status && status !== 'all') {
    query = query.eq('pass_status', status === 'pass')
  }

  const { data: results, count, error } = await query
    .range((page - 1) * pageSize, page * pageSize - 1)

  const totalPages = count ? Math.ceil(count / pageSize) : 0

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Test Results</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Participant Scores</CardTitle>
          <CardDescription>
            View scores and pass/fail status of all participants.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResultsFilters />
          <div className="rounded-md border max-h-[600px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>SIM Type</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results?.map((r, index) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-xs text-center">
                      {(page - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell>{new Date(r.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                    <TableCell className="font-medium">{r.participant_name}</TableCell>
                    <TableCell>{r.participant_email}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.sim_type === 'A'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                        }`}>
                        SIM {r.sim_type}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold">{r.total_score}</TableCell>
                    <TableCell>
                      {r.pass_status ? (
                        <span className="text-green-600 dark:text-green-400 font-semibold p-1 px-2 bg-green-100 dark:bg-green-900/30 rounded text-[10px]">LULUS</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 font-semibold p-1 px-2 bg-red-100 dark:bg-red-900/30 rounded text-[10px]">TIDAK LULUS</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!results?.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No test results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between py-2">
              <p className="text-sm text-muted-foreground italic">
                Showing {Math.min((page - 1) * pageSize + 1, count || 0)} to {Math.min(page * pageSize, count || 0)} of {count} entries
              </p>
              <div className="flex items-center space-x-2">
                <Link
                  href={`/admin/results?page=${page - 1}${search ? `&search=${search}` : ''}${simType ? `&sim_type=${simType}` : ''}${status ? `&status=${status}` : ''}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    page <= 1 && "pointer-events-none opacity-50"
                  )}
                >
                  Previous
                </Link>
                <div className="text-sm font-medium">
                  Page {page} of {totalPages}
                </div>
                <Link
                  href={`/admin/results?page=${page + 1}${search ? `&search=${search}` : ''}${simType ? `&sim_type=${simType}` : ''}${status ? `&status=${status}` : ''}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    page >= totalPages && "pointer-events-none opacity-50"
                  )}
                >
                  Next
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
