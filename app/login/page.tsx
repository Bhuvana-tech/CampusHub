'use client';

import { useState, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/lib/user-context';
import { X, ChevronDown, ArrowRight } from 'lucide-react';

const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
const branches = ['CSE', 'ECE', 'Mechanical', 'Civil', 'EEE', 'IT', 'Other'];

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUser();
  
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('');
  const [branch, setBranch] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [showSemesterDropdown, setShowSemesterDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 8) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!semester) newErrors.semester = 'Select your semester';
    if (!branch) newErrors.branch = 'Select your branch';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    setUser({
      name: name.trim(),
      semester,
      branch,
      skills,
    });
    
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-1">CampusHub</h1>
          <p className="text-sm text-muted-foreground">Set up your profile to get started</p>
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
            <Input
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          {/* Semester Dropdown */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Semester</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowSemesterDropdown(!showSemesterDropdown);
                  setShowBranchDropdown(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 border rounded-md bg-background text-left ${
                  errors.semester ? 'border-destructive' : 'border-input-border'
                }`}
              >
                <span className={semester ? 'text-foreground' : 'text-muted-foreground'}>
                  {semester ? `${semester} Semester` : 'Select semester'}
                </span>
                <ChevronDown size={16} className="text-muted-foreground" />
              </button>
              
              {showSemesterDropdown && (
                <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {semesters.map(sem => (
                    <button
                      key={sem}
                      type="button"
                      onClick={() => {
                        setSemester(sem);
                        setShowSemesterDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-muted text-sm ${
                        semester === sem ? 'bg-primary text-white hover:bg-primary' : ''
                      }`}
                    >
                      {sem} Semester
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.semester && <p className="text-xs text-destructive mt-1">{errors.semester}</p>}
          </div>

          {/* Branch Dropdown */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Branch</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowBranchDropdown(!showBranchDropdown);
                  setShowSemesterDropdown(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 border rounded-md bg-background text-left ${
                  errors.branch ? 'border-destructive' : 'border-input-border'
                }`}
              >
                <span className={branch ? 'text-foreground' : 'text-muted-foreground'}>
                  {branch || 'Select branch'}
                </span>
                <ChevronDown size={16} className="text-muted-foreground" />
              </button>
              
              {showBranchDropdown && (
                <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-border rounded-md shadow-lg">
                  {branches.map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setBranch(b);
                        setShowBranchDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-muted text-sm ${
                        branch === b ? 'bg-primary text-white hover:bg-primary' : ''
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.branch && <p className="text-xs text-destructive mt-1">{errors.branch}</p>}
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Skills / Interests <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Type and press Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button type="button" variant="outline" onClick={addSkill} disabled={!skillInput.trim()}>
                Add
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {skills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button onClick={handleSubmit} className="w-full mt-6 gap-2">
            Get Started
            <ArrowRight size={16} />
          </Button>
        </div>
      </Card>
    </div>
  );
}
