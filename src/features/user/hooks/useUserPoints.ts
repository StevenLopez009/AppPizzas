"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface PointsData {
  points: number;
  history: Array<{
    id: string;
    user_id: string;
    amount: number;
    reason: string;
    order_id: string | null;
    created_at: string;
  }>;
}

export function useUserPoints() {
  const [data, setData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPoints() {
      try {
        setLoading(true);
        const response = await api.get<PointsData>("/api/user-points");
        setData(response);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching points");
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPoints();
  }, []);

  return { data, loading, error };
}
