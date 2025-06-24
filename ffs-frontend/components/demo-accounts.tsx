"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { mockUsers } from "@/types/user"

export function DemoAccounts() {
  const demoUsers = mockUsers.filter((user) => user.demoAccount === true)

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>Demo Accounts</CardTitle>
        <CardDescription>
          Use these accounts to test the application with different user roles and permissions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px]">Role</TableHead>
              <TableHead className="w-[250px]">Email</TableHead>
              <TableHead className="w-[120px]">Password</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {demoUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {/* Display all roles */}
                  {user.roles.map((role) => role.type).join(", ")}

                  {/* Display bid roles if they exist and are not "None" */}
                  {user.bidRoles && user.bidRoles.length > 0 && user.bidRoles[0].type !== "None" && (
                    <>
                      <br />
                      <span className="text-sm text-muted-foreground">
                        Bid: {user.bidRoles.map((role) => role.type).join(", ")}
                      </span>
                    </>
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm">{user.email}</TableCell>
                <TableCell className="font-mono text-sm">Abc&123!</TableCell>
                <TableCell>
                  {user.roles.some((role) => role.type === "Co-op Admin") && "Full access to all co-op features. "}

                  {user.roles.some((role) => role.type === "District Admin") && "Manage district schools and users. "}

                  {user.roles.some((role) => role.type === "School Admin") && "Manage a specific school. "}

                  {user.roles.some((role) => role.type === "Viewer") &&
                    user.bidRoles.some((role) => role.type === "Bid Administrator") &&
                    "Create and manage bids. "}

                  {user.roles.some((role) => role.type === "Viewer") &&
                    !user.bidRoles.some((role) => role.type === "Bid Administrator") &&
                    "View-only access. "}

                  {user.email === "demovendor@foodforschools.com" && "Vendor access to view and respond to bids. "}

                  {user.roles.some((role) => role.type === "Co-op Admin") &&
                    user.roles.some((role) => role.type === "District Admin") &&
                    "Has both Co-op and District Admin roles."}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
