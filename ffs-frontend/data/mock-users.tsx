"use client"

import type { User } from "@/types/user"

export const mockUsers: User[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Smith",
    email: "democoopadmin@foodforschools.com",
    roles: [
      {
        type: "Group Admin",
        scope: {
          type: "coop",
          id: "coop-1",
        },
        permissions: ["manage_users", "manage_districts", "manage_schools", "view_all", "edit_all"],
      },
    ],
    bidRoles: [
      {
        type: "Bid Administrator",
        scope: {
          type: "coop",
          id: "coop-1",
        },
        permissions: ["create_bids", "edit_bids", "delete_bids", "award_bids", "manage_bid_users"],
      },
    ],
    managedBids: ["BID-2023-001", "BID-2023-005"],
    status: "Active",
    lastLogin: "2023-05-15T10:30:00Z",
    demoAccount: true,
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Miller",
    email: "demodistrictadmin@foodforschools.com",
    roles: [
      {
        type: "District Admin",
        scope: {
          type: "district",
          id: "district-1",
        },
        permissions: ["manage_users", "manage_schools", "edit_district", "view_district"],
      },
    ],
    bidRoles: [
      {
        type: "Bid Administrator",
        scope: {
          type: "district",
          id: "district-1",
        },
        permissions: ["create_bids", "edit_bids", "delete_bids", "award_bids", "manage_bid_users"],
      },
    ],
    managedBids: ["BID-2023-004"],
    status: "Active",
    lastLogin: "2023-05-13T09:15:00Z",
    demoAccount: true,
  },
  {
    id: "3",
    firstName: "Taylor",
    lastName: "Chen",
    email: "demoschooladmin@foodforschools.com",
    roles: [
      {
        type: "School Admin",
        scope: {
          type: "school",
          id: "school-101",
        },
        permissions: ["edit_school", "view_school"],
      },
      {
        type: "Viewer",
        scope: {
          type: "district",
          id: "district-1",
        },
        permissions: ["view_district"],
      },
    ],
    bidRoles: [
      {
        type: "Bid Viewer",
        scope: {
          type: "district",
          id: "district-1",
        },
        permissions: ["view_bids"],
      },
    ],
    managedBids: [],
    status: "Active",
    lastLogin: "2023-05-12T11:20:00Z",
    demoAccount: true,
  },
  {
    id: "4",
    firstName: "Casey",
    lastName: "Nguyen",
    email: "demoreadonly@foodforschools.com",
    roles: [
      {
        type: "Viewer",
        scope: {
          type: "district",
          id: "district-1",
        },
        permissions: ["view_district"],
      },
    ],
    bidRoles: [
      {
        type: "Bid Viewer",
        scope: {
          type: "district",
          id: "district-1",
        },
        permissions: ["view_bids"],
      },
    ],
    managedBids: [],
    status: "Active",
    lastLogin: "2023-05-11T15:30:00Z",
    demoAccount: true,
  },
  {
    id: "5",
    firstName: "Emily",
    lastName: "Davis",
    email: "demobidadmin@foodforschools.com",
    roles: [
      {
        type: "Viewer",
        scope: {
          type: "district",
          id: "district-1",
        },
        permissions: ["view_district"],
      },
    ],
    bidRoles: [
      {
        type: "Bid Administrator",
        scope: {
          type: "district",
          id: "district-1",
        },
        permissions: ["create_bids", "edit_bids", "delete_bids", "award_bids", "manage_bid_users"],
      },
    ],
    managedBids: ["BID-2023-001", "BID-2023-003"],
    status: "Active",
    lastLogin: "2023-05-10T13:45:00Z",
    demoAccount: true,
  },
  {
    id: "6",
    firstName: "Alex",
    lastName: "Ramirez",
    email: "demodualadmin@foodforschools.com",
    roles: [
      {
        type: "Group Admin",
        scope: {
          type: "coop",
          id: "coop-1",
        },
        permissions: ["manage_users", "manage_districts", "manage_schools", "view_all", "edit_all"],
      },
      {
        type: "District Admin",
        scope: {
          type: "district",
          id: "district-1",
        },
        permissions: ["manage_users", "manage_schools", "edit_district", "view_district"],
      },
    ],
    bidRoles: [
      {
        type: "Bid Administrator",
        scope: {
          type: "coop",
          id: "coop-1",
        },
        permissions: ["create_bids", "edit_bids", "delete_bids", "award_bids", "manage_bid_users"],
      },
    ],
    managedBids: ["BID-2023-002"],
    status: "Active",
    lastLogin: "2023-05-14T14:45:00Z",
    demoAccount: true,
  },
  {
    id: "7",
    firstName: "Vendor",
    lastName: "Jones",
    email: "demovendor@foodforschools.com",
    roles: [
      {
        type: "Viewer",
        scope: {
          type: "coop",
          id: "coop-1",
        },
        permissions: ["view_bids"],
      },
    ],
    bidRoles: [],
    managedBids: [],
    status: "Active",
    lastLogin: "2023-05-09T10:15:00Z",
    demoAccount: true,
  },
]
