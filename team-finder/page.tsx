'use client';

import { Sidebar } from '@/components/sidebar';
import { PageLayout } from '@/components/page-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '@/lib/user-context';

const defaultProfiles = [
  { 
    id: 1, 
    name: 'Aditi Sharma', 
    semester: '4th',
    branch: 'CSE',
    skills: ['Python', 'Machine Learning', 'Data Science'], 
    bio: 'Passionate about AI and data-driven solutions' 
  },
  { 
    id: 2, 
    name: 'Sanjana Reddy', 
    semester: '6th',
    branch: 'CSE',
    skills: ['Deep Learning', 'Cloud Computing', 'AWS'], 
    bio: 'Working on neural networks and cloud infrastructure' 
  },
  { 
    id: 3, 
    name: 'Pawan Kumar', 
    semester: '4th',
    branch: 'IT',
    skills: ['React', 'Node.js', 'UI/UX'], 
    bio: 'Full-stack developer, hackathon enthusiast' 
  },
  { 
    id: 4, 
    name: 'Chaitanya S', 
    semester: '5th',
    branch: 'CSE',
    skills: ['Data Science', 'Python', 'SQL'], 
    bio: 'Data science and backend development' 
  },
  { 
    id: 5, 
    name: 'Meera Nair', 
    semester: '3rd',
    branch: 'ECE',
    skills: ['IoT', 'Embedded Systems', 'Arduino'], 
    bio: 'Hardware meets software - IoT projects' 
  },
  { 
    id: 6, 
    name: 'Arjun Mehta', 
    semester: '5th',
    branch: 'CSE',
    skills: ['Flutter', 'Firebase', 'Mobile Dev'], 
    bio: 'Building mobile apps that solve real problems' 
  },
];

export default function TeamFinderPage() {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [connectedIds, setConnectedIds] = useState<number[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('All');

  const branches = ['All', 'CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil'];

  const allProfiles = user ? [
    {
      id: 0,
      name: user.name,
      semester: user.semester,
      branch: user.branch,
      skills: user.skills,
      bio: 'This is you!',
      isCurrentUser: true,
    },
    ...defaultProfiles,
  ] : defaultProfiles;

  const filteredProfiles = allProfiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          profile.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          profile.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesBranch = selectedBranch === 'All' || profile.branch === selectedBranch;
    return matchesSearch && matchesBranch;
  });

  const toggleConnect = (profileId: number) => {
    setConnectedIds(prev => 
      prev.includes(profileId) 
        ? prev.filter(id => id !== profileId) 
        : [...prev, profileId]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Sidebar />
      <PageLayout title="Team Finder" subtitle="Find teammates for hackathons and projects">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
            <Input
              placeholder="Search by name or skills..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Branch</label>
            <div className="flex gap-2 flex-wrap">
              {branches.map(branch => (
                <Button
                  key={branch}
                  variant={selectedBranch === branch ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedBranch(branch)}
                  className="rounded-full"
                >
                  {branch}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {filteredProfiles.map(profile => {
              const isCurrentUser = 'isCurrentUser' in profile && profile.isCurrentUser;
              
              return (
                <Card 
                  key={profile.id} 
                  className={`p-4 hover:shadow-md transition-shadow ${isCurrentUser ? 'border-primary/30 bg-primary/5' : ''}`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm ${
                      isCurrentUser ? 'bg-primary text-white' : 'bg-muted text-foreground'
                    }`}>
                      {getInitials(profile.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground truncate">{profile.name}</h3>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-primary text-white">You</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {profile.semester} Sem | {profile.branch}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{profile.bio}</p>

                  {profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {profile.skills.slice(0, 4).map(skill => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border"
                        >
                          {skill}
                        </span>
                      ))}
                      {profile.skills.length > 4 && (
                        <span className="text-xs text-muted-foreground">+{profile.skills.length - 4}</span>
                      )}
                    </div>
                  )}

                  {!isCurrentUser && (
                    <Button
                      variant={connectedIds.includes(profile.id) ? 'default' : 'outline'}
                      className="w-full text-sm"
                      onClick={() => toggleConnect(profile.id)}
                    >
                      {connectedIds.includes(profile.id) ? 'Requested' : 'Connect'}
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>

          {filteredProfiles.length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">
              <p>No profiles found. Try adjusting your search or filters.</p>
            </Card>
          )}
        </div>
      </PageLayout>
    </>
  );
}
