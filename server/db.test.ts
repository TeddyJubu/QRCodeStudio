// Mock database for testing
export const pool = {
  query: async () => ({ rows: [] }),
  end: async () => {},
};

export const db = {
  select: () => ({ from: () => ({ where: () => ({ limit: () => [] }) }) }),
  insert: () => ({ values: () => ({ returning: () => [] }) }),
  update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
  delete: () => ({ where: () => ({ returning: () => [] }) }),
};
