import { describe, expect, it } from 'vitest'

import { ROUTE_PATH_LICENSES } from '@/app/constants'
import { buildPrimaryNavigation } from '@/app/navigation/primaryNav'
import { UI_NAV_ID_LICENSES } from '@/ui/navigation/navConstants'
import { buildPermissions } from '../../factories/permissionFactory'
import { buildUser } from '../../factories/userFactory'

describe('buildPrimaryNavigation', () => {
  it('marks parent nav as active for nested license routes', () => {
    const currentPath = `${ROUTE_PATH_LICENSES}/license-123/details`
    const navigation = buildPrimaryNavigation({
      permissions: buildPermissions({ manageLicenses: true }),
      currentUser: buildUser(),
      currentPath,
    })

    const licenseNav = navigation.find((item) => item.id === UI_NAV_ID_LICENSES)
    expect(licenseNav?.active).toBe(true)
  })
})

