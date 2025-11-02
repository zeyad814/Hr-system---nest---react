import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  Download,
  Eye,
  Star,
  Globe,
  Github,
  Linkedin,
  FileText,
  Camera
} from "lucide-react"
import { MainLayout } from "@/components/layout/MainLayout"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type Applicant, applicantApiService } from "@/services/applicantApi"
import { toast } from "sonner"
import { useLanguage } from "@/contexts/LanguageContext"

const ApplicantProfile = () => {
  const { t } = useLanguage()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [applicantData, setApplicantData] = useState<Applicant | null>(null)
  const [formData, setFormData] = useState({
    phone: '',
    location: '',
    address: '',
    skills: '',
    experience: '',
    education: '',
    portfolio: ''
  })
  
  // Load applicant data from API
  useEffect(() => {
    const loadApplicantData = async () => {
      try {
        setLoading(true)
        const data = await applicantApiService.getProfile()
        setApplicantData(data)
      } catch (error) {
        console.error('Error loading applicant data:', error)
        toast.error(t('applicant.profile.loadError'))
      } finally {
        setLoading(false)
      }
    }

    loadApplicantData()
  }, [])

  // Update profile function
  const updateProfile = async (updatedData: any) => {
    try {
      setUpdating(true)
      const data = await applicantApiService.updateProfile(updatedData)
       setApplicantData(data)
      toast.success(t('applicant.profile.updateSuccess'))
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(t('applicant.profile.updateError'))
    } finally {
      setUpdating(false)
    }
  }

  // Handle save changes
  const handleSaveChanges = () => {
    updateProfile(formData)
  }

  // Handle cancel editing
  const handleCancelEditing = () => {
    if (applicantData) {
      setFormData({
        phone: applicantData.phone || '',
        location: applicantData.location || '',
        address: applicantData.address || '',
        skills: applicantData.skills || '',
        experience: applicantData.experience || '',
        education: applicantData.education || '',
        portfolio: applicantData.portfolio || ''
      })
    }
    setIsEditing(false)
  }

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('applicant.profile.invalidImageFile'))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('applicant.profile.imageSizeError'))
      return
    }

    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64String = e.target?.result as string
        
        try {
          // Update profile with new avatar
          const updateData = {
            avatar: base64String
          }
          
          await applicantApiService.updateProfile(updateData)
          
          // Update local state
          setApplicantData(prev => prev ? {
            ...prev,
            avatar: base64String
          } : null)
          
          toast.success(t('applicant.profile.avatarUpdateSuccess'))
        } catch (error) {
          console.error('Error updating avatar:', error)
          toast.error(t('applicant.profile.avatarUpdateError'))
        }
      }
      
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error processing avatar:', error)
      toast.error(t('applicant.profile.imageProcessError'))
    }
  }

  // Document management functions
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if (!allowedTypes.includes(file.type)) {
      toast.error(t('applicant.profile.invalidFileType'))
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('applicant.profile.fileTooLarge'))
      return
    }

    try {
      setUpdating(true)
      const updatedApplicant = await applicantApiService.uploadCV(file)
      setApplicantData(updatedApplicant)
      toast.success(t('applicant.profile.documentUploadSuccess'))
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error(t('applicant.profile.documentUploadError'))
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteDocument = (index: number) => {
    setProfile(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }))
    toast.success(t('applicant.profile.documentDeleteSuccess'))
  }

  const handleViewDocument = (url: string) => {
    window.open(url, '_blank')
  }

  const handleDownloadDocument = (url: string, name: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Education management functions
  const [isAddingEducation, setIsAddingEducation] = useState(false)
  // Utility function to convert YYYY-MM format to ISO date string
  const convertMonthToISODate = (monthString: string) => {
    if (!monthString) return null;
    const [year, month] = monthString.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, 1).toISOString();
  };

  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    location: '',
    startDate: '',
    endDate: '',
    gpa: '',
    description: ''
  })

  const handleAddEducation = async () => {
    try {
      // Create education using dedicated endpoint
      const educationData = {
        degree: newEducation.degree,
        institution: newEducation.institution,
        location: newEducation.location,
        startDate: convertMonthToISODate(newEducation.startDate),
        endDate: newEducation.endDate ? convertMonthToISODate(newEducation.endDate) : null,
        current: !newEducation.endDate,
        gpa: newEducation.gpa,
        description: newEducation.description
      }
      
      const createdEducation = await applicantApiService.createEducation(educationData)
      
      // Update profile state
      setProfile(prev => ({
        ...prev,
        education: [...prev.education, createdEducation]
      }))
      
      setNewEducation({
        degree: '',
        institution: '',
        location: '',
        startDate: '',
        endDate: '',
        gpa: '',
        description: ''
      })
      setIsAddingEducation(false)
      toast.success(t('applicant.profile.educationAddSuccess'))
    } catch (error) {
      console.error('Error saving education:', error)
      toast.error(t('applicant.profile.educationAddError'))
    }
  }

  const handleDeleteEducation = async (id: string) => {
    try {
      // Delete education using dedicated endpoint
      await applicantApiService.deleteEducation(id)
      
      // Update profile state
      setProfile(prev => ({
        ...prev,
        education: prev.education.filter(edu => edu.id !== id)
      }))
      
      toast.success(t('applicant.profile.educationDeleteSuccess'))
    } catch (error) {
      console.error('Error deleting education:', error)
      toast.error(t('applicant.profile.educationDeleteError'))
    }
  }

  // Experience management functions
  const [isAddingExperience, setIsAddingExperience] = useState(false)
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    achievements: []
  })

  const handleAddExperience = async () => {
    try {
      // Create experience using dedicated endpoint
      const experienceData = {
        title: newExperience.title,
        company: newExperience.company,
        location: newExperience.location,
        startDate: convertMonthToISODate(newExperience.startDate),
        endDate: newExperience.current ? null : convertMonthToISODate(newExperience.endDate),
        current: newExperience.current,
        description: newExperience.description,
        achievements: Array.isArray(newExperience.achievements) ? newExperience.achievements.join('\n') : ''
      }
      
      const createdExperience = await applicantApiService.createExperience(experienceData)
      
      // Update profile state
      setProfile(prev => ({
        ...prev,
        experience: [...prev.experience, createdExperience]
      }))
      
      setNewExperience({
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        achievements: []
      })
      setIsAddingExperience(false)
      toast.success(t('applicant.profile.experienceAddSuccess'))
    } catch (error) {
      console.error('Error saving experience:', error)
      toast.error(t('applicant.profile.experienceAddError'))
    }
  }

  const handleDeleteExperience = async (id: string) => {
    try {
      // Delete experience using dedicated endpoint
      await applicantApiService.deleteExperience(id)
      
      // Update profile state
      setProfile(prev => ({
        ...prev,
        experience: prev.experience.filter(exp => exp.id !== id)
      }))
      
      toast.success(t('applicant.profile.experienceDeleteSuccess'))
    } catch (error) {
      console.error('Error deleting experience:', error)
      toast.error(t('applicant.profile.experienceDeleteError'))
    }
  }

  // Skills management functions
  const [isAddingSkill, setIsAddingSkill] = useState(false)
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: '',
    level: 50
  })

  const handleAddSkill = async () => {
    try {
      const updatedSkills = [...profile.skills, newSkill]
      
      // Update profile state
      setProfile(prev => ({
        ...prev,
        skills: updatedSkills
      }))
      
      // Save to database
      const updateData = {
        skills: JSON.stringify(updatedSkills)
      }
      
      await applicantApiService.updateProfile(updateData)
      
      setNewSkill({
        name: '',
        category: '',
        level: 50
      })
      setIsAddingSkill(false)
      toast.success(t('applicant.profile.skillAddSuccess'))
    } catch (error) {
      console.error('Error saving skill:', error)
      toast.error(t('applicant.profile.skillAddError'))
    }
  }

  const handleDeleteSkill = async (index: number) => {
    try {
      const updatedSkills = profile.skills.filter((_, i) => i !== index)
      
      // Update profile state
      setProfile(prev => ({
        ...prev,
        skills: updatedSkills
      }))
      
      // Save to database
      const updateData = {
        skills: JSON.stringify(updatedSkills)
      }
      
      await applicantApiService.updateProfile(updateData)
      
      toast.success(t('applicant.profile.skillDeleteSuccess'))
    } catch (error) {
      console.error('Error deleting skill:', error)
      toast.error(t('applicant.profile.skillDeleteError'))
    }
  }

  // Projects management functions
  const [isAddingProject, setIsAddingProject] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    technologies: '',
    url: '',
    demo: '',
    image: ''
  })

  const handleAddProject = async () => {
    // Validate required fields
    if (!newProject.name.trim()) {
      toast.error(t('applicant.profile.projectNameRequired'))
      return
    }
    if (!newProject.description.trim()) {
      toast.error(t('applicant.profile.projectDescriptionRequired'))
      return
    }
    
    try {
      // Create project using dedicated endpoint
      const projectData = {
        title: newProject.name.trim(),
        description: newProject.description.trim(),
        technologies: newProject.technologies ? newProject.technologies.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0) : [],
        url: newProject.url.trim(),
        githubUrl: newProject.demo.trim(),
        current: false
      }
      
      const createdProject = await applicantApiService.createProject(projectData)
      
      // Update profile state
      setProfile(prev => ({
        ...prev,
        projects: [...prev.projects, createdProject]
      }))
      
      setNewProject({
        name: '',
        description: '',
        technologies: '',
        url: '',
        demo: '',
        image: ''
      })
      setIsAddingProject(false)
      toast.success(t('applicant.profile.projectAddSuccess'))
    } catch (error) {
      console.error('Error saving project:', error)
      toast.error(t('applicant.profile.projectAddError'))
    }
  }

  const handleDeleteProject = async (id: string) => {
    try {
      // Delete project using dedicated endpoint
      await applicantApiService.deleteProject(id)
      
      // Update profile state
      setProfile(prev => ({
        ...prev,
        projects: prev.projects.filter(project => project.id !== id)
      }))
      
      toast.success(t('applicant.profile.projectDeleteSuccess'))
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error(t('applicant.profile.projectDeleteError'))
    }
  }

  // Certifications management functions
  const [isAddingCertification, setIsAddingCertification] = useState(false)
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    date: '',
    expiryDate: '',
    credentialId: ''
  })

  const handleAddCertification = async () => {
    // Validate required fields
    if (!newCertification.name.trim()) {
      toast.error(t('applicant.profile.certificationNameRequired'))
      return
    }
    if (!newCertification.issuer.trim()) {
      toast.error(t('applicant.profile.certificationIssuerRequired'))
      return
    }
    if (!newCertification.date.trim()) {
      toast.error(t('applicant.profile.certificationDateRequired'))
      return
    }
    
    try {
      // Create qualification using dedicated endpoint
      const qualificationData = {
        title: newCertification.name.trim(),
        issuer: newCertification.issuer.trim(),
        issueDate: convertMonthToISODate(newCertification.date.trim()),
        expiryDate: newCertification.expiryDate.trim() ? convertMonthToISODate(newCertification.expiryDate.trim()) : null,
        credentialId: newCertification.credentialId.trim() || null
      }
      
      const createdQualification = await applicantApiService.createQualification(qualificationData)
      
      // Update profile state
      setProfile(prev => ({
        ...prev,
        certifications: [...prev.certifications, createdQualification]
      }))
      
      setNewCertification({
        name: '',
        issuer: '',
        date: '',
        expiryDate: '',
        credentialId: ''
      })
      setIsAddingCertification(false)
      toast.success(t('applicant.profile.certificationAddSuccess'))
    } catch (error) {
      console.error('Error saving certification:', error)
      toast.error(t('applicant.profile.certificationAddError'))
    }
  }

  const handleDeleteCertification = async (id: string) => {
    try {
      // Delete qualification using dedicated endpoint
      await applicantApiService.deleteQualification(id)
      
      // Update profile state
      setProfile(prev => ({
        ...prev,
        certifications: prev.certifications.filter(cert => cert.id !== id)
      }))
      
      toast.success(t('applicant.profile.certificationDeleteSuccess'))
    } catch (error) {
      console.error('Error deleting certification:', error)
      toast.error(t('applicant.profile.certificationDeleteError'))
    }
  }

  // Initialize form data when applicant data loads
  useEffect(() => {
    if (applicantData) {
      setFormData({
        phone: applicantData.phone || '',
        location: applicantData.location || '',
        address: applicantData.address || '',
        skills: applicantData.skills || '',
        experience: applicantData.experience || '',
        education: applicantData.education || '',
        portfolio: applicantData.portfolio || ''
      })
    }
  }, [applicantData])

  // Calculate profile completeness
  const calculateProfileCompleteness = () => {
    if (!applicantData) return 0
    
    const fields = [
      applicantData.user.name,
      applicantData.user.email,
      applicantData.phone,
      applicantData.location,
      applicantData.skills,
      applicantData.experience,
      applicantData.education,
      applicantData.resumeUrl,
      applicantData.avatar
    ]
    
    const filledFields = fields.filter(field => field && field.trim() !== '').length
    return Math.round((filledFields / fields.length) * 100)
  }
  
  // Profile data from API - replaces mock data
  const [profile, setProfile] = useState({
    personal: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      dateOfBirth: "",
      nationality: "",
      maritalStatus: "",
      avatar: "",
      summary: ""
    },
    experience: [] as any[],
    education: [] as any[],
    skills: [] as any[],
    languages: [] as any[],
    certifications: [] as any[],
    projects: [] as any[],
    socialLinks: {
      linkedin: "",
      github: "",
      website: "",
      portfolio: ""
    },
    documents: [] as any[]
  })

  // Load profile data from API
  useEffect(() => {
    const loadProfileData = async () => {
      if (applicantData) {
        try {
          // Load experiences, education, projects, and qualifications from API
          const [experiences, education, projects, qualifications] = await Promise.all([
            applicantApiService.getExperiences().catch(() => []),
            applicantApiService.getEducations().catch(() => []),
            applicantApiService.getProjects().catch(() => []),
            applicantApiService.getQualifications().catch(() => [])
          ]);

          // Parse skills and languages from JSON strings or comma-separated strings
          const parseSkills = (skillsString?: string) => {
            if (!skillsString) return [];
            
            // Try to parse as JSON first (new format)
            try {
              const parsed = JSON.parse(skillsString);
              if (Array.isArray(parsed)) {
                return parsed;
              }
            } catch (error) {
              // If JSON parsing fails, try comma-separated format (legacy)
              return skillsString.split(',').map(skill => ({
                name: skill.trim(),
                level: 75, // Default level
                category: 'General'
              }));
            }
            
            return [];
          };

          const parseLanguages = (languagesString?: string) => {
            if (!languagesString) return [];
            
            // Try to parse as JSON first (new format)
            try {
              const parsed = JSON.parse(languagesString);
              if (Array.isArray(parsed)) {
                return parsed;
              }
            } catch (error) {
              // If JSON parsing fails, try comma-separated format (legacy)
              return languagesString.split(',').map(lang => ({
                name: lang.trim(),
                level: t('applicant.profile.intermediate') // Default level
              }));
            }
            
            return [];
          };

          // Prepare documents array with resume if available
          const documents = [];
          if (applicantData.resumeUrl) {
            documents.push({
              name: 'السيرة الذاتية',
              type: 'PDF',
              size: 'N/A',
              url: applicantData.resumeUrl,
              uploadDate: new Date().toISOString()
            });
          }

          // Update profile with real data
          setProfile({
            personal: {
              firstName: applicantData.user.name.split(' ')[0] || '',
              lastName: applicantData.user.name.split(' ').slice(1).join(' ') || '',
              email: applicantData.user.email,
              phone: applicantData.phone || '',
              location: applicantData.location || '',
              dateOfBirth: applicantData.dateOfBirth || '',
              nationality: applicantData.nationality || '',
              maritalStatus: applicantData.maritalStatus || '',
              avatar: applicantData.avatar || '',
              summary: applicantData.bio || ''
            },
            experience: experiences,
            education: education,
            skills: parseSkills(applicantData.skills),
            languages: parseLanguages(applicantData.languages),
            certifications: qualifications,
            projects: projects,
            socialLinks: {
              linkedin: applicantData.linkedin || '',
              github: applicantData.github || '',
              website: applicantData.website || '',
              portfolio: applicantData.portfolio || ''
            },
            documents: documents
          });
        } catch (error) {
          console.error('Error loading profile data:', error);
          toast.error(t('applicant.profile.loadProfileError'));
        }
      }
    };

    loadProfileData();
  }, [applicantData]);

  const profileCompleteness = () => {
    let completed = 0
    let total = 8
    
    if (profile.personal.firstName && profile.personal.lastName) completed++
    if (profile.personal.email && profile.personal.phone) completed++
    if (profile.personal.summary) completed++
    if (profile.experience.length > 0) completed++
    if (profile.education.length > 0) completed++
    if (profile.skills.length > 0) completed++
    if (profile.certifications.length > 0) completed++
    if (profile.documents.length > 0) completed++
    
    return Math.round((completed / total) * 100)
  }

  const getSkillColor = (level: number) => {
    if (level >= 80) return "bg-green-500"
    if (level >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const formatDateAr = (value?: string) => {
    if (!value) return ''
    try {
      const d = new Date(value)
      if (Number.isNaN(d.getTime())) return value
      return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' })
    } catch {
      return value
    }
  }

  const ExperienceCard = ({ exp, onEdit, onDelete }: { exp: any, onEdit: () => void, onDelete: () => void }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold">{exp.title}</h3>
            <p className="text-muted-foreground">{exp.company} • {exp.location}</p>
            <p className="text-sm text-muted-foreground">
              {formatDateAr(exp.startDate)} - {exp.current ? t('applicant.profile.present') : formatDateAr(exp.endDate)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm mb-3">{exp.description}</p>
        {exp.achievements && exp.achievements.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">{t('applicant.profile.achievements')}:</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              {exp.achievements.map((achievement: string, index: number) => (
                <li key={index}>{achievement}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const EducationCard = ({ edu, onEdit, onDelete }: { edu: any, onEdit: () => void, onDelete: () => void }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold">{edu.degree}</h3>
            <p className="text-muted-foreground">{edu.institution} • {edu.location}</p>
            <p className="text-sm text-muted-foreground">
              {edu.startDate} - {edu.endDate}
              {edu.gpa && ` • ${t('applicant.profile.gpa')}: ${edu.gpa}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {edu.description && <p className="text-sm">{edu.description}</p>}
      </CardContent>
    </Card>
  )

  const ProjectCard = ({ project, onEdit, onDelete }: { project: any, onEdit: () => void, onDelete: () => void }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{project.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {project.technologies.map((tech: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">{tech}</Badge>
              ))}
            </div>
            <div className="flex gap-2">
              {project.url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={project.url} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 ml-1" />
                    {t('applicant.profile.code')}
                  </a>
                </Button>
              )}
              {project.demo && (
                <Button variant="outline" size="sm" asChild>
                  <a href={project.demo} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4 ml-1" />
                    {t('applicant.profile.demo')}
                  </a>
                </Button>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Show loading state
  if (loading) {
    return (
      <MainLayout userRole="applicant">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('applicant.profile.loading')}</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Show error state if no data
  if (!applicantData) {
    return (
      <MainLayout userRole="applicant">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">{t('applicant.profile.noDataFound')}</p>
            <Button onClick={() => window.location.reload()}>{t('applicant.profile.retry')}</Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout userRole="applicant">
      <div className="space-y-6 px-4 sm:px-6" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={applicantData.avatar || ''} alt={applicantData.user.name} />
                <AvatarFallback className="text-lg">
                  {applicantData.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button size="sm" variant="outline" className="absolute -bottom-2 -left-2 h-8 w-8 rounded-full p-0">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center sm:text-right w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold">{applicantData.user.name}</h1>
              <p className="text-muted-foreground text-sm sm:text-base">{applicantData.user.email}</p>
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-2 sm:gap-4 mt-2">
                {applicantData.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-xs sm:text-sm">{applicantData.location}</span>
                  </div>
                )}
                {applicantData.phone && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span className="text-xs sm:text-sm">{applicantData.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button onClick={() => setIsEditing(!isEditing)} className="w-full sm:w-auto text-sm">
              {isEditing ? (
                <><Edit className="h-4 w-4 ml-2" />{t('applicant.profile.editProfile')}</>
              ) : (
                <><Edit className="h-4 w-4 ml-2" /><span className="hidden sm:inline">{t('applicant.profile.editProfile')}</span><span className="sm:hidden">{t('applicant.profile.edit')}</span></>
              )}
            </Button>
          </div>
        </div>

        {/* Profile Completeness */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{t('applicant.profile.profileCompleteness')}</h3>
              <span className="text-sm font-medium">{calculateProfileCompleteness()}%</span>
            </div>
            <Progress value={calculateProfileCompleteness()} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {t('applicant.profile.completeProfileMessage')}
            </p>
          </CardContent>
        </Card>

        {/* Portfolio Link */}
        {applicantData.portfolio && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t('applicant.profile.portfolioAndProjects')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                  <a href={applicantData.portfolio} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 ml-1" />
                    {t('applicant.profile.viewPortfolio')}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 h-auto">
            <TabsTrigger value="personal" className="text-xs sm:text-sm p-2 sm:p-3">
              <span className="hidden sm:inline">{t('applicant.profile.personalInfo')}</span>
              <span className="sm:hidden">{t('applicant.profile.personal')}</span>
            </TabsTrigger>
            <TabsTrigger value="experience" className="text-xs sm:text-sm p-2 sm:p-3">
              <span className="hidden sm:inline">{t('applicant.profile.experience')}</span>
              <span className="sm:hidden">{t('applicant.profile.experience')}</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="text-xs sm:text-sm p-2 sm:p-3">
              <span className="hidden sm:inline">{t('applicant.profile.education')}</span>
              <span className="sm:hidden">{t('applicant.profile.education')}</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="text-xs sm:text-sm p-2 sm:p-3">
              <span className="hidden sm:inline">{t('applicant.profile.skills')}</span>
              <span className="sm:hidden">{t('applicant.profile.skills')}</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="text-xs sm:text-sm p-2 sm:p-3">
              <span className="hidden sm:inline">{t('applicant.profile.projects')}</span>
              <span className="sm:hidden">{t('applicant.profile.projects')}</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs sm:text-sm p-2 sm:p-3">
              <span className="hidden sm:inline">{t('applicant.profile.documents')}</span>
              <span className="sm:hidden">{t('applicant.profile.documents')}</span>
            </TabsTrigger>
            <TabsTrigger value="cv" className="text-xs sm:text-sm p-2 sm:p-3">
              <span className="hidden sm:inline">منشئ السيرة الذاتية</span>
              <span className="sm:hidden">السيرة</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>{t('applicant.profile.personalInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center space-y-4 mb-6">
                  <div className="relative">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={applicantData.avatar || ''} alt={applicantData.user.name} />
                      <AvatarFallback className="text-2xl">
                        {applicantData.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div className="absolute bottom-0 right-0">
                        <label htmlFor="avatar-upload" className="cursor-pointer">
                          <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors">
                            <Camera className="h-4 w-4" />
                          </div>
                        </label>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <p className="text-sm text-muted-foreground text-center">
                      {t('applicant.profile.clickCameraToChangePhoto')}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">{t('applicant.profile.fullName')}</Label>
                    <Input
                      id="name"
                      value={applicantData.user.name}
                      disabled={true}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t('applicant.profile.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={applicantData.user.email}
                      disabled={true}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t('applicant.profile.phone')}</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={!isEditing}
                      placeholder={t('applicant.profile.enterPhone')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">{t('applicant.profile.location')}</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      disabled={!isEditing}
                      placeholder={t('applicant.profile.enterLocation')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">{t('applicant.profile.address')}</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      disabled={!isEditing}
                      placeholder={t('applicant.profile.enterDetailedAddress')}
                    />
                  </div>
                </div>
                
                {/* Skills */}
                <div>
                  <Label htmlFor="skills">{t('applicant.profile.skills')}</Label>
                  <Textarea
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                    disabled={!isEditing}
                    rows={3}
                    placeholder={t('applicant.profile.enterSkillsCommaSeparated')}
                  />
                </div>
                
                {/* Experience */}
                <div>
                  <Label htmlFor="experience">{t('applicant.profile.experience')}</Label>
                  <Textarea
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    disabled={!isEditing}
                    rows={4}
                    placeholder={t('applicant.profile.writeAboutExperience')}
                  />
                </div>
                
                {/* Education */}
                <div>
                  <Label htmlFor="education">{t('applicant.profile.education')}</Label>
                  <Textarea
                    id="education"
                    value={formData.education}
                    onChange={(e) => setFormData({...formData, education: e.target.value})}
                    disabled={!isEditing}
                    rows={3}
                    placeholder={t('applicant.profile.writeAboutEducation')}
                  />
                </div>
                
                {/* Portfolio */}
                <div>
                  <Label htmlFor="portfolio">{t('applicant.profile.portfolioLink')}</Label>
                  <Input
                    id="portfolio"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
                    disabled={!isEditing}
                    placeholder={t('applicant.profile.portfolioPlaceholder')}
                  />
                </div>
                
                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSaveChanges} disabled={updating}>
                      <Save className="h-4 w-4 ml-2" />
                      {updating ? t('applicant.profile.saving') : t('applicant.profile.saveChanges')}
                    </Button>
                    <Button variant="outline" onClick={handleCancelEditing}>
                      <X className="h-4 w-4 ml-2" />
                      {t('applicant.profile.cancel')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CV Builder */}
          <TabsContent value="cv">
            <Card>
              <CardHeader>
                <CardTitle>منشئ السيرة الذاتية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cv-summary">الملخص المهني</Label>
                    <Textarea id="cv-summary" rows={3}
                      placeholder="اكتب ملخصاً قصيراً عن خبراتك ومهاراتك"
                      value={(profile as any).cvSummary || ''}
                      onChange={(e) => setProfile((p) => ({ ...p, cvSummary: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cv-objective">الهدف الوظيفي</Label>
                    <Textarea id="cv-objective" rows={3}
                      placeholder="اكتب الهدف الوظيفي"
                      value={(profile as any).cvObjective || ''}
                      onChange={(e) => setProfile((p) => ({ ...p, cvObjective: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cv-theme">النمط</Label>
                    <Select value={(profile as any).cvTheme || 'light'} onValueChange={(v) => setProfile((p) => ({ ...p, cvTheme: v }))}>
                      <SelectTrigger id="cv-theme">
                        <SelectValue placeholder="اختر النمط" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">فاتح</SelectItem>
                        <SelectItem value="dark">داكن</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input id="cv-include-projects" type="checkbox"
                      checked={(profile as any).cvIncludeProjects ?? true}
                      onChange={(e) => setProfile((p) => ({ ...p, cvIncludeProjects: e.target.checked }))}
                    />
                    <Label htmlFor="cv-include-projects">إظهار المشاريع</Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => {
                    const theme = (profile as any).cvTheme || 'light'
                    const includeProjects = (profile as any).cvIncludeProjects ?? true
                    const summary = (profile as any).cvSummary || ''
                    const objective = (profile as any).cvObjective || ''
                    const doc = window.open('', '_blank')
                    if (!doc) return
                    const styles = `
                      <style>
                        body { direction: rtl; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; background: ${theme==='dark'?'#0b1020':'#fff'}; color: ${theme==='dark'?'#eef2ff':'#111827'}; }
                        .section { margin-bottom: 16px; }
                        .title { font-size: 20px; font-weight: 700; margin: 0 0 8px; }
                        .muted { color: ${theme==='dark'?'#a5b4fc':'#6b7280'}; }
                        .chip { display:inline-block; padding:2px 8px; border-radius:12px; background:${theme==='dark'?'#1f2937':'#f3f4f6'}; margin:2px; }
                        .divider { height:1px; background:${theme==='dark'?'#374151':'#e5e7eb'}; margin:12px 0; }
                      </style>
                    `
                    const header = `
                      <div class="section">
                        <div class="title">${applicantData.user.name}</div>
                        <div class="muted">${applicantData.user.email}${applicantData.phone? ' • ' + applicantData.phone: ''}${applicantData.location? ' • ' + applicantData.location: ''}</div>
                      </div>
                      <div class="divider"></div>
                    `
                    const summaryBlock = summary ? `<div class="section"><div class="title">الملخص</div><div>${summary}</div></div>` : ''
                    const objectiveBlock = objective ? `<div class="section"><div class="title">الهدف</div><div>${objective}</div></div>` : ''
                    const expBlock = (profile.experience && profile.experience.length) ? `
                      <div class="section">
                        <div class="title">الخبرات</div>
                        ${profile.experience.map((e:any)=>`<div style="margin-bottom:8px">
                          <div style="font-weight:600">${e.title} • ${e.company}</div>
                          <div class="muted">${e.location || ''}</div>
                          <div class="muted">${e.startDate || ''}${e.current? ' - حتى الآن' : (e.endDate? ' - ' + e.endDate : '')}</div>
                          ${e.description? `<div>${e.description}</div>`:''}
                        </div>`).join('')}
                      </div>
                    ` : ''
                    const eduBlock = (profile.education && profile.education.length) ? `
                      <div class="section">
                        <div class="title">التعليم</div>
                        ${profile.education.map((ed:any)=>`<div style="margin-bottom:8px">
                          <div style="font-weight:600">${ed.degree}</div>
                          <div class="muted">${ed.institution}${ed.location? ' • ' + ed.location : ''}</div>
                          <div class="muted">${ed.startDate || ''}${ed.endDate? ' - ' + ed.endDate: ''}</div>
                        </div>`).join('')}
                      </div>
                    ` : ''
                    const skillsBlock = (profile.skills && profile.skills.length) ? `
                      <div class="section">
                        <div class="title">المهارات</div>
                        <div>
                          ${profile.skills.map((s:any)=>`<span class="chip">${s.name}${s.level? ' • ' + s.level + '%' : ''}</span>`).join('')}
                        </div>
                      </div>
                    ` : ''
                    const projectsBlock = (includeProjects && profile.projects && profile.projects.length) ? `
                      <div class="section">
                        <div class="title">المشاريع</div>
                        ${profile.projects.map((p:any)=>`<div style="margin-bottom:8px">
                          <div style="font-weight:600">${p.name || p.title || ''}</div>
                          ${p.description? `<div>${p.description}</div>`:''}
                        </div>`).join('')}
                      </div>
                    ` : ''
                    doc.document.write(`<!DOCTYPE html><html><head><meta charset='utf-8'/>${styles}</head><body>
                      ${header}
                      ${summaryBlock}
                      ${objectiveBlock}
                      ${expBlock}
                      ${eduBlock}
                      ${skillsBlock}
                      ${projectsBlock}
                    </body></html>`)
                    doc.document.close()
                    doc.focus()
                    doc.print()
                  }}>
                    معاينة وطباعة (PDF)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experience */}
          <TabsContent value="experience">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{t('applicant.profile.workExperience')}</h2>
                <Button onClick={() => setIsAddingExperience(true)}>
                  <Plus className="h-4 w-4 ml-2" />
                  {t('applicant.profile.addExperience')}
                </Button>
              </div>
              
              {/* Add Experience Form */}
              {isAddingExperience && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('applicant.profile.addNewWorkExperience')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="jobTitle">{t('applicant.profile.jobTitle')}</Label>
                        <Input
                          id="jobTitle"
                          value={newExperience.title}
                          onChange={(e) => setNewExperience({...newExperience, title: e.target.value})}
                          placeholder={t('applicant.profile.jobTitleExample')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="company">{t('applicant.profile.companyName')}</Label>
                        <Input
                          id="company"
                          value={newExperience.company}
                          onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                          placeholder={t('applicant.profile.companyNameExample')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">{t('applicant.profile.location')}</Label>
                        <Input
                          id="location"
                          value={newExperience.location}
                          onChange={(e) => setNewExperience({...newExperience, location: e.target.value})}
                          placeholder={t('applicant.profile.locationExample')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="startDate">{t('applicant.profile.startDate')}</Label>
                        <Input
                          id="startDate"
                          type="month"
                          value={newExperience.startDate}
                          onChange={(e) => setNewExperience({...newExperience, startDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">{t('applicant.profile.endDate')}</Label>
                        <Input
                          id="endDate"
                          type="month"
                          value={newExperience.endDate}
                          onChange={(e) => setNewExperience({...newExperience, endDate: e.target.value})}
                          disabled={newExperience.current}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="current"
                          checked={newExperience.current}
                          onChange={(e) => setNewExperience({...newExperience, current: e.target.checked, endDate: e.target.checked ? '' : newExperience.endDate})}
                          className="ml-2"
                        />
                        <Label htmlFor="current">{t('applicant.profile.currentlyWorking')}</Label>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">{t('applicant.profile.tasksAndResponsibilities')}</Label>
                      <Textarea
                        id="description"
                        value={newExperience.description}
                        onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                        placeholder={t('applicant.profile.detailedTasksPlaceholder')}
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddExperience}>
                        <Save className="h-4 w-4 ml-2" />
                        {t('applicant.profile.save')}
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddingExperience(false)}>
                        <X className="h-4 w-4 ml-2" />
                        {t('applicant.profile.cancel')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Experience List */}
              {profile.experience.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('applicant.profile.noExperienceAdded')}</p>
                  <p className="text-sm">{t('applicant.profile.clickAddExperience')}</p>
                </div>
              ) : (
                profile.experience.map((exp) => (
                  <Card key={exp.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{exp.title}</h3>
                          <p className="text-muted-foreground">{exp.company} • {exp.location}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDateAr(exp.startDate)} - {exp.current ? t('applicant.profile.present') : formatDateAr(exp.endDate)}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteExperience(exp.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm mb-3">{exp.description}</p>
                      {exp.achievements && exp.achievements.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">{t('applicant.profile.achievements')}:</h4>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {exp.achievements.map((achievement: string, index: number) => (
                              <li key={index}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Education */}
          <TabsContent value="education">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{t('applicant.profile.education')}</h2>
                <Button onClick={() => setIsAddingEducation(true)}>
                  <Plus className="h-4 w-4 ml-2" />
                  {t('applicant.profile.addQualification')}
                </Button>
              </div>
              
              {/* Add Education Form */}
              {isAddingEducation && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('applicant.profile.addNewEducationalQualification')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="degree">{t('applicant.profile.degree')}</Label>
                        <Input
                          id="degree"
                          value={newEducation.degree}
                          onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                          placeholder={t('applicant.profile.degreeExample')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="institution">{t('applicant.profile.educationalInstitution')}</Label>
                        <Input
                          id="institution"
                          value={newEducation.institution}
                          onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                          placeholder={t('applicant.profile.institutionExample')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="startDate">{t('applicant.profile.startDate')}</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={newEducation.startDate}
                          onChange={(e) => setNewEducation({...newEducation, startDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">{t('applicant.profile.endDate')}</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={newEducation.endDate}
                          onChange={(e) => setNewEducation({...newEducation, endDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="gpa">{t('applicant.profile.gpa')}</Label>
                        <Input
                          id="gpa"
                          value={newEducation.gpa}
                          onChange={(e) => setNewEducation({...newEducation, gpa: e.target.value})}
                          placeholder={t('applicant.profile.gpaExample')}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">{t('applicant.profile.description')}</Label>
                      <Textarea
                        id="description"
                        value={newEducation.description}
                        onChange={(e) => setNewEducation({...newEducation, description: e.target.value})}
                        placeholder={t('applicant.profile.additionalDescriptionPlaceholder')}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddEducation}>
                        <Save className="h-4 w-4 ml-2" />
                        {t('common.save')}
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddingEducation(false)}>
                        <X className="h-4 w-4 ml-2" />
                        {t('common.cancel')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Education List */}
              {profile.education.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('applicant.profile.noEducationAdded')}</p>
                  <p className="text-sm">{t('applicant.profile.clickAddQualification')}</p>
                </div>
              ) : (
                profile.education.map((edu) => (
                  <Card key={edu.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{edu.degree}</h4>
                          <p className="text-muted-foreground">{edu.institution}</p>
                          <p className="text-sm text-muted-foreground">
                            {edu.startDate} - {edu.endDate}
                          </p>
                          {edu.gpa && (
                            <p className="text-sm text-muted-foreground">{t('applicant.profile.gpa')}: {edu.gpa}</p>
                          )}
                          {edu.description && (
                            <p className="text-sm mt-2">{edu.description}</p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteEducation(edu.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              
              {/* Certifications */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    {t('applicant.profile.certificationsAndCourses')}
                  </h3>
                  <Button variant="outline" onClick={() => setIsAddingCertification(true)}>
                    <Plus className="h-4 w-4 ml-2" />
                    {t('applicant.profile.addCertification')}
                  </Button>
                </div>
                
                {/* Add Certification Form */}
                {isAddingCertification && (
                  <Card className="mb-4">
                    <CardHeader>
                      <CardTitle>{t('applicant.profile.addNewCertification')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="certName">{t('applicant.profile.certificateName')}</Label>
                          <Input
                            id="certName"
                            value={newCertification.name}
                            onChange={(e) => setNewCertification({...newCertification, name: e.target.value})}
                            placeholder={t('applicant.profile.certificateNameExample')}
                          />
                        </div>
                        <div>
                          <Label htmlFor="issuer">{t('applicant.profile.issuer')}</Label>
                          <Input
                            id="issuer"
                            value={newCertification.issuer}
                            onChange={(e) => setNewCertification({...newCertification, issuer: e.target.value})}
                            placeholder={t('applicant.profile.issuerExample')}
                          />
                        </div>
                        <div>
                          <Label htmlFor="certDate">{t('applicant.profile.issueDate')}</Label>
                          <Input
                            id="certDate"
                            type="date"
                            value={newCertification.date}
                            onChange={(e) => setNewCertification({...newCertification, date: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="expiryDate">{t('applicant.profile.expiryDate')}</Label>
                          <Input
                            id="expiryDate"
                            type="date"
                            value={newCertification.expiryDate}
                            onChange={(e) => setNewCertification({...newCertification, expiryDate: e.target.value})}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="credentialId">{t('applicant.profile.credentialId')}</Label>
                          <Input
                            id="credentialId"
                            value={newCertification.credentialId}
                            onChange={(e) => setNewCertification({...newCertification, credentialId: e.target.value})}
                            placeholder={t('applicant.profile.credentialIdPlaceholder')}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddCertification}>
                          <Save className="h-4 w-4 ml-2" />
                          {t('applicant.profile.save')}
                        </Button>
                        <Button variant="outline" onClick={() => setIsAddingCertification(false)}>
                          <X className="h-4 w-4 ml-2" />
                          {t('applicant.profile.cancel')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Certifications List */}
                {profile.certifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('applicant.profile.noCertificationsAdded')}</p>
                    <p className="text-sm">{t('applicant.profile.clickAddCertification')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.certifications.map((cert) => (
                      <Card key={cert.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold">{cert.name}</h4>
                              <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                              <p className="text-xs text-muted-foreground">
                                {cert.date} {cert.expiryDate && `- ${cert.expiryDate}`}
                              </p>
                              {cert.credentialId && (
                                <p className="text-xs text-muted-foreground">ID: {cert.credentialId}</p>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteCertification(cert.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Skills */}
          <TabsContent value="skills">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{t('applicant.profile.skills')}</h2>
                <Button onClick={() => setIsAddingSkill(true)}>
                  <Plus className="h-4 w-4 ml-2" />
                  {t('applicant.profile.addSkill')}
                </Button>
              </div>
              
              {/* Add Skill Form */}
              {isAddingSkill && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('applicant.profile.addNewSkill')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="skillName">{t('applicant.profile.skillName')}</Label>
                        <Input
                          id="skillName"
                          value={newSkill.name}
                          onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                          placeholder={t('applicant.profile.skillNameExample')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="skillCategory">{t('applicant.profile.category')}</Label>
                        <Select value={newSkill.category} onValueChange={(value) => setNewSkill({...newSkill, category: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('applicant.profile.selectSkillCategory')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="البرمجة">{t('applicant.profile.programming')}</SelectItem>
                            <SelectItem value="التصميم">{t('applicant.profile.design')}</SelectItem>
                            <SelectItem value="إدارة المشاريع">{t('applicant.profile.projectManagement')}</SelectItem>
                            <SelectItem value="التسويق">{t('applicant.profile.marketing')}</SelectItem>
                            <SelectItem value="المبيعات">{t('applicant.profile.sales')}</SelectItem>
                            <SelectItem value="الموارد البشرية">{t('applicant.profile.humanResources')}</SelectItem>
                            <SelectItem value="المحاسبة">{t('applicant.profile.accounting')}</SelectItem>
                            <SelectItem value="اللغات">{t('applicant.profile.languages')}</SelectItem>
                            <SelectItem value="أخرى">{t('applicant.profile.other')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="skillLevel">{t('applicant.profile.proficiencyLevel')}: {newSkill.level}%</Label>
                      <input
                        type="range"
                        id="skillLevel"
                        min="0"
                        max="100"
                        value={newSkill.level}
                        onChange={(e) => setNewSkill({...newSkill, level: parseInt(e.target.value)})}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{t('applicant.profile.beginner')}</span>
                        <span>{t('applicant.profile.intermediate')}</span>
                        <span>{t('applicant.profile.advanced')}</span>
                        <span>{t('applicant.profile.expert')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddSkill}>
                        <Save className="h-4 w-4 ml-2" />
                        {t('common.save')}
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddingSkill(false)}>
                        <X className="h-4 w-4 ml-2" />
                        {t('common.cancel')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Skills List */}
              {profile.skills.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('applicant.profile.noSkillsAdded')}</p>
                  <p className="text-sm">{t('applicant.profile.clickAddSkill')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.skills.map((skill, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold">{skill.name}</h4>
                            <p className="text-sm text-muted-foreground">{skill.category}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{skill.level}%</span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteSkill(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getSkillColor(skill.level)}`}
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Projects */}
          <TabsContent value="projects">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{t('applicant.profile.projects')}</h2>
                <Button onClick={() => setIsAddingProject(true)}>
                  <Plus className="h-4 w-4 ml-2" />
                  {t('applicant.profile.addProject')}
                </Button>
              </div>
              
              {/* Add Project Form */}
              {isAddingProject && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('applicant.profile.addNewProject')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="projectName">{t('applicant.profile.projectName')}</Label>
                        <Input
                          id="projectName"
                          value={newProject.name}
                          onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                          placeholder={t('applicant.profile.projectNameExample')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="projectUrl">{t('applicant.profile.projectUrl')}</Label>
                        <Input
                          id="projectUrl"
                          value={newProject.url}
                          onChange={(e) => setNewProject({...newProject, url: e.target.value})}
                          placeholder="https://example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="projectDemo">{t('applicant.profile.demoUrl')}</Label>
                        <Input
                          id="projectDemo"
                          value={newProject.demo}
                          onChange={(e) => setNewProject({...newProject, demo: e.target.value})}
                          placeholder="https://demo.example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="projectImage">{t('applicant.profile.imageUrl')}</Label>
                        <Input
                          id="projectImage"
                          value={newProject.image}
                          onChange={(e) => setNewProject({...newProject, image: e.target.value})}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="projectDescription">{t('applicant.profile.projectDescription')}</Label>
                      <Textarea
                        id="projectDescription"
                        value={newProject.description}
                        onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                        placeholder={t('applicant.profile.projectDescriptionPlaceholder')}
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="projectTechnologies">{t('applicant.profile.technologiesUsed')}</Label>
                      <Input
                        id="projectTechnologies"
                        value={newProject.technologies}
                        onChange={(e) => setNewProject({...newProject, technologies: e.target.value})}
                        placeholder={t('applicant.profile.technologiesPlaceholder')}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddProject}>
                        <Save className="h-4 w-4 ml-2" />
                        {t('applicant.profile.save')}
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddingProject(false)}>
                        <X className="h-4 w-4 ml-2" />
                        {t('applicant.profile.cancel')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Projects List */}
              {profile.projects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('applicant.profile.noProjectsAdded')}</p>
                  <p className="text-sm">{t('applicant.profile.clickAddProject')}</p>
                </div>
              ) : (
                profile.projects.map((project) => (
                  <Card key={project.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-lg">{project.name}</h4>
                            {project.url && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={project.url} target="_blank" rel="noopener noreferrer">
                                  <Globe className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            {project.demo && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={project.demo} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {project.technologies.map((tech, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {project.image && (
                        <div className="mt-4">
                          <img 
                            src={project.image} 
                            alt={project.name}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{t('applicant.profile.documents')}</h2>
                <div className="relative">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                  />
                  <Button onClick={() => document.getElementById('file-upload')?.click()}>
                    <Upload className="h-4 w-4 ml-2" />
                    {t('applicant.profile.uploadDocument')}
                  </Button>
                </div>
              </div>
              
              {profile.documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('applicant.profile.noDocumentsUploaded')}</p>
                  <p className="text-sm">{t('applicant.profile.clickUploadDocument')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.documents.map((doc, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <h4 className="font-semibold">{doc.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {doc.type} • {doc.size}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownloadDocument(doc.url, doc.name)}
                              title={t('applicant.profile.downloadDocument')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteDocument(index)}
                              title={t('applicant.profile.deleteDocument')}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancelEditing}>
              {t('applicant.profile.cancel')}
            </Button>
            <Button onClick={handleSaveChanges} disabled={updating}>
              <Save className="h-4 w-4 ml-2" />
              {updating ? t('applicant.profile.saving') : t('applicant.profile.saveChanges')}
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default ApplicantProfile