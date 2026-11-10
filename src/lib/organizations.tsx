import { createContext, use, useState, useMemo, useCallback, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import {
  invitationCreateMutation,
  memberListOptions,
  memberListQueryKey,
  organizationCreateMutation,
  organizationListOptions,
  organizationListQueryKey,
  teamListOptions,
} from '@/api/generated/@tanstack/react-query.gen'
import type { OrganizationWithRole } from '@/api/generated/types.gen'

interface OrganizationContextType {
  organizations: OrganizationWithRole[]
  currentOrg: OrganizationWithRole | null
  isLoading: boolean
  setCurrentOrg: (org: OrganizationWithRole | null) => void
  refreshOrganizations: () => void
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

const CURRENT_ORG_KEY = 'current_organization_id'

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(
    () => localStorage.getItem(CURRENT_ORG_KEY)
  )
  const queryClient = useQueryClient()

  const { data: organizations = [], isLoading } = useQuery(organizationListOptions())

  // Derive currentOrg during render — no useEffect needed
  const currentOrg = useMemo(() => {
    if (organizations.length === 0) return null
    const saved = organizations.find((o) => o.id === currentOrgId)
    return saved ?? organizations[0]
  }, [organizations, currentOrgId])

  const setCurrentOrg = useCallback((org: OrganizationWithRole | null) => {
    const id = org?.id ?? null
    setCurrentOrgId(id)
    if (id) {
      localStorage.setItem(CURRENT_ORG_KEY, id)
    } else {
      localStorage.removeItem(CURRENT_ORG_KEY)
    }
  }, [])

  const refreshOrganizations = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: organizationListQueryKey() })
  }, [queryClient])

  const contextValue = useMemo(
    () => ({ organizations, currentOrg, isLoading, setCurrentOrg, refreshOrganizations }),
    [organizations, currentOrg, isLoading, setCurrentOrg, refreshOrganizations]
  )

  return (
    <OrganizationContext.Provider value={contextValue}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = use(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}

export function useTeams(orgId: string | undefined) {
  return useQuery({
    ...teamListOptions({ path: { org_id: orgId ?? '' } }),
    enabled: !!orgId,
  })
}

export function useMembers(orgId: string | undefined) {
  return useQuery({
    ...memberListOptions({ path: { org_id: orgId ?? '' } }),
    enabled: !!orgId,
  })
}

export function useCreateOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    ...organizationCreateMutation(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: organizationListQueryKey() }),
  })
}

export function useInviteMember() {
  const queryClient = useQueryClient()
  return useMutation({
    ...invitationCreateMutation(),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: memberListQueryKey({ path: { org_id: variables.path.org_id } }),
      }),
  })
}
