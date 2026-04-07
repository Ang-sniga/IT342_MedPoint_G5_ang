const ROLE_PATIENT = 1;
const ROLE_CLINIC_STAFF = 2;

const dashboardRoutes = {
  patient: '/patient-dashboard',
  clinic: '/clinic-dashboard'
};

class PatientRoleStrategy {
  getRoleId() {
    return ROLE_PATIENT;
  }

  getDashboardPath() {
    return dashboardRoutes.patient;
  }
}

class ClinicStaffRoleStrategy {
  getRoleId() {
    return ROLE_CLINIC_STAFF;
  }

  getDashboardPath() {
    return dashboardRoutes.clinic;
  }
}

const roleStrategies = {
  [ROLE_PATIENT]: new PatientRoleStrategy(),
  [ROLE_CLINIC_STAFF]: new ClinicStaffRoleStrategy()
};

export const roleNavigationStrategy = {
  getDashboardPathByRoleId(roleId) {
    const normalizedRoleId = Number(roleId);
    const strategy = roleStrategies[normalizedRoleId];

    return strategy ? strategy.getDashboardPath() : null;
  },

  canAccessDashboard(storedRole, expectedRoleId) {
    return Number(storedRole) === Number(expectedRoleId);
  },

  roleIds: {
    patient: ROLE_PATIENT,
    clinicStaff: ROLE_CLINIC_STAFF
  }
};