import { useState, useEffect } from "react";
import { skillsApi } from "@/lib/api/skills";
import type { Skill } from "@/lib/api-types";

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const data = await skillsApi.list();
        setSkills(data);
      } catch (error) {
        console.error("Failed to fetch skills", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkills();
  }, []);

  return {
    skills,
    isLoading,
  };
}
