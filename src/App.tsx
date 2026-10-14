import React, { useState, useEffect } from 'react';
import {
  AIModelConfig,
  AIPromptsConfig,
  InstructorProfileData,
  Lesson,
  PacingRecommendation,
  Section,
  StudentProfileData,
  StudentSubmission,
  SystemStats,
  User,
  UserRole,
} from './types';
import { Storage } from './utils/storage';
import { RolePicker } from './components/common/RolePicker';
import { StudentProfileSetup } from './components/auth/StudentProfileSetup';
import { InstructorProfileSetup } from './components/auth/InstructorProfileSetup';
import { StudentClassroomsView } from './components/student/StudentClassroomsView';
import { StudentRoadmapView } from './components/student/StudentRoadmapView';
import { StudentLessonView } from './components/student/StudentLessonView';
import { StudentTestView } from './components/student/StudentTestView';
import { InstructorDashboard } from './components/instructor/InstructorDashboard';
import { AdminView } from './components/admin/AdminView';

export default function App() {
  // Navigation: activeRole is null when on RolePicker
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);

  // Student specific navigation states
  const [studentScreen, setStudentScreen] = useState<
    'classrooms' | 'roadmap' | 'lesson' | 'baseline' | 'profile_setup'
  >('classrooms');
  const [selectedClassroom, setSelectedClassroom] = useState<Section | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Application Data States
  const [sections, setSections] = useState<Section[]>([]);
  const [profiles, setProfiles] = useState<Record<string, StudentProfileData>>({});
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [aiConfig, setAiConfig] = useState<AIModelConfig>(Storage.getAIModelConfig());
  const [aiPrompts, setAiPrompts] = useState<AIPromptsConfig>(Storage.getAIPrompts());
  const [recommendations, setRecommendations] = useState<PacingRecommendation[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>(Storage.getSystemStats());

  // Active Student for immediate test session
  const [currentStudentProfile, setCurrentStudentProfile] = useState<StudentProfileData | null>(null);

  // Active Instructor profile (remembered in browser storage)
  const [instructorProfile, setInstructorProfile] = useState<InstructorProfileData | null>(
    Storage.getInstructorProfile()
  );

  // Refresh all state from browser storage
  const refreshAllData = () => {
    setSections(Storage.getSections());
    setProfiles(Storage.getStudentProfiles());
    setSubmissions(Storage.getSubmissions());
    setAiConfig(Storage.getAIModelConfig());
    setAiPrompts(Storage.getAIPrompts());
    setRecommendations(Storage.getRecommendations());
    setSystemStats(Storage.getSystemStats());
    setInstructorProfile(Storage.getInstructorProfile());
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Handle Role Selection from RolePicker
  const handleSelectRole = (role: UserRole) => {
    refreshAllData();
    if (role === 'student') {
      setStudentScreen('classrooms');
      setSelectedClassroom(null);
      setActiveLesson(null);
    }
    setActiveRole(role);
  };

  // Switch role button (available on every screen)
  const handleSwitchRole = () => {
    refreshAllData();
    setCurrentStudentProfile(null);
    setSelectedClassroom(null);
    setActiveLesson(null);
    setStudentScreen('classrooms');
    setActiveRole(null);
  };

  // Instructor profile setup complete
  const handleInstructorSetupComplete = (inst: InstructorProfileData, firstSection: Section) => {
    refreshAllData();
    setInstructorProfile(inst);
  };

  // Student opens a classroom from My Classrooms
  const handleSelectClassroom = (classroom: Section) => {
    setSelectedClassroom(classroom);
    setStudentScreen('roadmap');
  };

  // Student starts Baseline Check from Roadmap
  const handleStartBaselineCheck = () => {
    if (!selectedClassroom) return;

    // Check if student profile exists for this section
    const existingProfiles = Storage.getStudentProfiles();
    const existing = Object.values(existingProfiles).find(
      (p) => p.sectionId === selectedClassroom.id
    );

    if (existing) {
      setCurrentStudentProfile(existing);
      setStudentScreen('baseline');
    } else {
      setStudentScreen('profile_setup');
    }
  };

  // Student completes quick profile setup for the baseline assessment
  const handleStudentProfileSetupComplete = (studentProf: StudentProfileData) => {
    refreshAllData();
    setCurrentStudentProfile(studentProf);
    setStudentScreen('baseline');
  };

  // Student finishes baseline test -> returns to Roadmap where node 1 is Completed
  const handleBaselineDone = () => {
    if (selectedClassroom) {
      Storage.markLessonComplete(selectedClassroom.id, 'baseline');
    }
    refreshAllData();
    setStudentScreen('roadmap');
  };

  // Student starts a lesson from Roadmap
  const handleStartLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setStudentScreen('lesson');
  };

  // Student finishes lesson -> returns to Roadmap
  const handleLessonComplete = () => {
    if (selectedClassroom && activeLesson) {
      Storage.markLessonComplete(selectedClassroom.id, activeLesson.id);
    }
    refreshAllData();
    setActiveLesson(null);
    setStudentScreen('roadmap');
  };

  // Reset Demo Data
  const handleDemoReset = () => {
    Storage.resetDemoData();
    refreshAllData();
    setCurrentStudentProfile(null);
    setSelectedClassroom(null);
    setActiveLesson(null);
    setStudentScreen('classrooms');
    setActiveRole(null);
  };

  // =========================================================================
  // SCREEN 1: SIMPLE ROLE PICKER (The App's First Screen)
  // =========================================================================
  if (!activeRole) {
    return (
      <RolePicker
        sections={sections}
        aiConfig={aiConfig}
        onSelectRole={handleSelectRole}
      />
    );
  }

  // =========================================================================
  // SCREEN 2: STUDENT ROLE (4 SCREENS: Classrooms, Roadmap, Lesson, Baseline)
  // =========================================================================
  if (activeRole === 'student') {
    // 1) MY CLASSROOMS (Student Home)
    if (studentScreen === 'classrooms' || !selectedClassroom) {
      return (
        <StudentClassroomsView
          sections={sections}
          submissions={submissions}
          onSelectClassroom={handleSelectClassroom}
          onSwitchRole={handleSwitchRole}
        />
      );
    }

    // 2) CLASSROOM ROADMAP
    if (studentScreen === 'roadmap') {
      return (
        <StudentRoadmapView
          section={selectedClassroom}
          submissions={submissions}
          onBack={() => {
            setSelectedClassroom(null);
            setStudentScreen('classrooms');
          }}
          onOpenBaselineCheck={handleStartBaselineCheck}
          onOpenLesson={handleStartLesson}
        />
      );
    }

    // Quick Profile Setup (if not yet completed before taking Baseline Check)
    if (studentScreen === 'profile_setup') {
      return (
        <StudentProfileSetup
          sections={[selectedClassroom]}
          onComplete={handleStudentProfileSetupComplete}
          onCancel={() => setStudentScreen('roadmap')}
        />
      );
    }

    // 3) LESSON VIEW (Interactive Logic Visualizer)
    if (studentScreen === 'lesson' && activeLesson) {
      return (
        <StudentLessonView
          lesson={activeLesson}
          sectionId={selectedClassroom.id}
          onBack={() => {
            setActiveLesson(null);
            setStudentScreen('roadmap');
          }}
          onComplete={handleLessonComplete}
        />
      );
    }

    // 4) BASELINE CHECK (Existing OLSAT Assessment)
    if (studentScreen === 'baseline' && currentStudentProfile) {
      return (
        <StudentTestView
          profile={currentStudentProfile}
          onDone={handleBaselineDone}
          onSwitchRole={handleSwitchRole}
        />
      );
    }

    // Fallback: return to classrooms
    return (
      <StudentClassroomsView
        sections={sections}
        submissions={submissions}
        onSelectClassroom={handleSelectClassroom}
        onSwitchRole={handleSwitchRole}
      />
    );
  }

  // =========================================================================
  // SCREEN 3: INSTRUCTOR ROLE
  // =========================================================================
  if (activeRole === 'instructor') {
    // First entry check: If no instructor profile / sections exist, show quick setup
    if (!instructorProfile || sections.length === 0) {
      return (
        <InstructorProfileSetup
          onComplete={handleInstructorSetupComplete}
          onCancel={handleSwitchRole}
        />
      );
    }

    const currentInstructorUser: User = {
      id: instructorProfile.userId,
      role: 'instructor',
      name: instructorProfile.fullName,
      email: instructorProfile.email || 'instructor@institution.edu',
      profileCompleted: true,
      createdAt: instructorProfile.updatedAt,
      active: true,
    };

    return (
      <InstructorDashboard
        currentUser={currentInstructorUser}
        sections={sections}
        profiles={profiles}
        submissions={submissions}
        recommendations={recommendations}
        onSubmissionUpdated={() => refreshAllData()}
        onRecommendationsUpdated={() => refreshAllData()}
        onSectionCreated={() => refreshAllData()}
        onLogout={handleSwitchRole}
      />
    );
  }

  // =========================================================================
  // SCREEN 4: SYSTEM ADMINISTRATOR ROLE (Connect AI Model)
  // =========================================================================
  if (activeRole === 'admin') {
    return (
      <AdminView
        aiConfig={aiConfig}
        aiPrompts={aiPrompts}
        systemStats={systemStats}
        sectionsCount={sections.length}
        submissionsCount={submissions.filter((s) => s.status === 'submitted').length}
        onConfigUpdated={(cfg) => {
          setAiConfig(cfg);
          refreshAllData();
        }}
        onPromptsUpdated={(prm) => {
          setAiPrompts(prm);
          refreshAllData();
        }}
        onDemoReset={handleDemoReset}
        onSwitchRole={handleSwitchRole}
      />
    );
  }

  return null;
}
