import { useState, useEffect, useCallback } from 'react';

const KEY = 'email_agent_profile_v1';

const emptyProfile = {
  name: '',
  university: '',
  year: '',
  targetRole: 'all',
  skills: [],
  skillConfidence: {}
};

export function useProfile() {
  const [profile, setProfile] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...emptyProfile, ...JSON.parse(raw) } : emptyProfile;
    } catch {
      return emptyProfile;
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(profile));
  }, [profile]);

  const updateProfile = useCallback((patch) => {
    setProfile((p) => ({ ...p, ...patch }));
  }, []);

  const addSkills = useCallback((skills) => {
    setProfile((p) => {
      const merged = [...new Set([...p.skills, ...skills.map(s => s.trim()).filter(Boolean)])];
      return { ...p, skills: merged };
    });
  }, []);

  const removeSkill = useCallback((skill) => {
    setProfile((p) => ({ ...p, skills: p.skills.filter(s => s !== skill) }));
  }, []);

  const setSkillConfidence = useCallback((skill, level) => {
    setProfile((p) => ({
      ...p,
      skillConfidence: { ...p.skillConfidence, [skill]: level }
    }));
  }, []);

  const isComplete = profile.name && profile.university && profile.skills.length > 0;

  return { profile, updateProfile, addSkills, removeSkill, setSkillConfidence, isComplete };
}
