// Shared semantic icon map. Import icons from here so the same meaning
// always uses the same glyph across the app. Extend cautiously — one
// meaning, one icon. Pair with components/common/IconTile for the
// editorial "outlined tile" pattern.
//
// Rules:
//   - stroke-width stays at the lucide default of 2 (do not override)
//   - size inherits from Tailwind h-* w-* on the receiving element
//   - color inherits from currentColor; never hardcode fill
//   - icons decorative next to a label → aria-hidden="true"
//   - icons standalone in a button → parent button MUST carry aria-label

export {
  // Navigation
  ArrowLeft as IconBack,
  ArrowRight as IconForward,
  ChevronLeft as IconPrev,
  ChevronRight as IconNext,
  ChevronUp as IconCollapse,
  ChevronDown as IconExpand,
  ArrowUpRight as IconOpenExternal,
  ExternalLink as IconExternal,
  X as IconClose,
  Menu as IconMenu,

  // Core actions
  Plus as IconAdd,
  Pencil as IconEdit,
  Trash2 as IconDelete,
  Copy as IconCopy,
  Download as IconDownload,
  Upload as IconUpload,
  RefreshCw as IconRefresh,
  MoreVertical as IconMore,
  Search as IconSearch,
  Filter as IconFilter,
  ArrowUpDown as IconSort,
  Send as IconSend,
  Share2 as IconShare,
  Link2 as IconLink,
  Play as IconPlay,
  Eye as IconShow,
  EyeOff as IconHide,

  // Domain objects
  User as IconUser,
  Users as IconUsers,
  UserCheck as IconUserVerified,
  Mail as IconMail,
  Phone as IconPhone,
  MapPin as IconLocation,
  Bell as IconBell,
  Calendar as IconCalendar,
  Clock as IconClock,
  FileText as IconFile,
  Folder as IconFolder,
  Briefcase as IconWork,
  GraduationCap as IconEducation,
  Code as IconCode,
  Layout as IconLayout,
  LayoutDashboard as IconDashboard,
  ClipboardCheck as IconReview,
  Clipboard as IconClipboard,
  CreditCard as IconPayment,
  IndianRupee as IconRupee,
  BarChart2 as IconChart,
  Grid as IconGrid,
  Tag as IconTag,
  Star as IconFavorite,
  Award as IconAward,
  Globe as IconPublic,
  Gauge as IconMetric,
  Linkedin as IconLinkedIn,

  // State / feedback
  CheckCircle as IconSuccess,
  AlertCircle as IconError,
  AlertTriangle as IconWarning,
  Info as IconInfo,
  BadgeCheck as IconVerified,
  BadgeAlert as IconUnverified,
  Sparkles as IconMagic,
  Check as IconCheck,
  XCircle as IconFail,
  Loader2 as IconSpinner,

  // Auth / security
  Lock as IconLock,
  ShieldCheck as IconShield,
  Shield as IconSecurity,
  Key as IconKey,
  KeyRound as IconKeyRound,
  LogOut as IconLogout,
  Settings as IconSettings,

  // Comms
  MessageCircle as IconMessage,
  MessageSquare as IconChat,
  Video as IconVideo,
  Paperclip as IconAttachment,
} from 'lucide-react';
