import type { MethodId } from "./guide-data";
import type { Locale } from "./i18n";

export const researchSources = {
  "jbi-manual": {
    title: "JBI Manual for Evidence Synthesis",
    owner: "JBI",
    href: "https://jbi-global-wiki.refined.site/space/MANUAL",
  },
  "cochrane-search": {
    title: "Cochrane Handbook, Chapter 4: Searching for and selecting studies",
    owner: "Cochrane",
    href: "https://training.cochrane.org/handbook/current/chapter-04",
  },
  "cochrane-data": {
    title: "Cochrane Handbook, Chapter 5: Collecting data",
    owner: "Cochrane",
    href: "https://training.cochrane.org/handbook/current/chapter-05",
  },
  "cochrane-risk-bias": {
    title: "Cochrane Handbook, Chapter 8: Assessing risk of bias",
    owner: "Cochrane",
    href: "https://training.cochrane.org/handbook/current/chapter-08",
  },
  "cochrane-meta-analysis": {
    title: "Cochrane Handbook, Chapter 10: Analysing data and undertaking meta-analyses",
    owner: "Cochrane",
    href: "https://training.cochrane.org/handbook/current/chapter-10",
  },
  "cochrane-overviews": {
    title: "Cochrane Handbook, Chapter V: Overviews of Reviews",
    owner: "Cochrane",
    href: "https://training.cochrane.org/handbook/current/chapter-v",
  },
  "cochrane-rapid": {
    title: "Cochrane Rapid Review Methods Guidance",
    owner: "Cochrane Rapid Reviews Methods Group",
    href: "https://methods.cochrane.org/rapidreviews/cochrane-rr-methods",
  },
  prisma: {
    title: "PRISMA 2020 Statement",
    owner: "PRISMA",
    href: "https://www.prisma-statement.org/prisma-2020",
  },
  "prisma-flow": {
    title: "PRISMA 2020 Flow Diagram",
    owner: "PRISMA",
    href: "https://www.prisma-statement.org/prisma-2020-flow-diagram",
  },
  "prisma-scr": {
    title: "PRISMA extension for Scoping Reviews",
    owner: "PRISMA",
    href: "https://www.prisma-statement.org/scoping",
  },
  "prisma-s": {
    title: "PRISMA-S: Reporting Literature Searches in Systematic Reviews",
    owner: "Systematic Reviews",
    href: "https://doi.org/10.1186/s13643-020-01542-z",
  },
  rameses: {
    title: "RAMESES Standards and Training Materials",
    owner: "RAMESES Project",
    href: "https://www.ramesesproject.org/Standards_and_Training_materials.php",
  },
  emerge: {
    title: "eMERGe Reporting Guidance for Meta-ethnography",
    owner: "eMERGe Project",
    href: "https://emergeproject.org/",
  },
  equator: {
    title: "Reporting Guidelines Database",
    owner: "EQUATOR Network",
    href: "https://www.equator-network.org/reporting-guidelines/",
  },
  "whittemore-knafl": {
    title: "The integrative review: updated methodology",
    owner: "Journal of Advanced Nursing",
    href: "https://doi.org/10.1111/j.1365-2648.2005.03621.x",
  },
  "grant-booth": {
    title: "A typology of reviews: an analysis of 14 review types and associated methodologies",
    owner: "Health Information & Libraries Journal",
    href: "https://doi.org/10.1111/j.1471-1842.2009.00848.x",
  },
  "donthu-bibliometric": {
    title: "How to conduct a bibliometric analysis: An overview and guidelines",
    owner: "Journal of Business Research",
    href: "https://doi.org/10.1016/j.jbusres.2021.04.070",
  },
  "thomas-harden": {
    title: "Methods for the thematic synthesis of qualitative research in systematic reviews",
    owner: "BMC Medical Research Methodology",
    href: "https://doi.org/10.1186/1471-2288-8-45",
  },
  "ucla-stat-choice": {
    title: "Choosing the Correct Statistical Test in SAS, Stata, SPSS and R",
    owner: "UCLA OARC",
    href: "https://stats.oarc.ucla.edu/other/mult-pkg/whatstat/",
  },
  "penn-anova": {
    title: "STAT 500: Introduction to ANOVA",
    owner: "Penn State Eberly College of Science",
    href: "https://online.stat.psu.edu/stat500/Lesson10.html",
  },
  "penn-correlation": {
    title: "STAT 500: Linear Regression Foundations and Correlation",
    owner: "Penn State Eberly College of Science",
    href: "https://online.stat.psu.edu/stat500/Lesson09.html",
  },
  "r-stats": {
    title: "R stats package documentation",
    owner: "R Core Team",
    href: "https://stat.ethz.ch/R-manual/R-devel/library/stats/html/00Index.html",
  },
  "scipy-stats": {
    title: "Statistical functions (scipy.stats)",
    owner: "SciPy",
    href: "https://docs.scipy.org/doc/scipy/reference/stats.html",
  },
  "delacre-welch": {
    title: "Why psychologists should by default use Welch's t-test instead of Student's t-test",
    owner: "International Review of Social Psychology",
    href: "https://doi.org/10.5334/irsp.82",
  },
  "cochran-chi-square": {
    title: "Some methods for strengthening the common chi-squared tests",
    owner: "Biometrics",
    href: "https://doi.org/10.2307/3001616",
  },
  "vittinghoff-epv": {
    title: "Relaxing the rule of ten events per variable in logistic and Cox regression",
    owner: "American Journal of Epidemiology",
    href: "https://doi.org/10.1093/aje/kwk052",
  },
} as const;

export type ResearchSourceId = keyof typeof researchSources;

export const sourceUiText: Record<Locale, { label: string; note: string }> = {
  en: {
    label: "Sources for this guidance",
    note: "Open the source and confirm that it fits your field, design, and current software version.",
  },
  th: {
    label: "แหล่งอ้างอิงสำหรับคำแนะนำส่วนนี้",
    note: "ควรเปิดอ่านต้นฉบับและตรวจอีกครั้งว่าเหมาะกับสาขา รูปแบบการวิจัย และโปรแกรมรุ่นที่ใช้อยู่หรือไม่",
  },
};

export const workflowSourceIds = {
  scope: ["jbi-manual"],
  search: ["cochrane-search", "prisma-s"],
  screen: ["cochrane-search", "prisma-flow"],
  appraise: ["cochrane-risk-bias", "jbi-manual"],
  extract: ["cochrane-data"],
  write: ["prisma", "prisma-s"],
} as const satisfies Record<string, readonly ResearchSourceId[]>;

export const workbenchSourceIds = {
  questionBuilder: ["jbi-manual"],
  screening: ["cochrane-search"],
  prisma: ["prisma", "prisma-flow"],
} as const satisfies Record<string, readonly ResearchSourceId[]>;

export const methodSourceIds: Record<MethodId, readonly ResearchSourceId[]> = {
  systematic: ["cochrane-search", "cochrane-risk-bias", "prisma"],
  scoping: ["jbi-manual", "prisma-scr"],
  "meta-analysis": ["cochrane-meta-analysis", "prisma"],
  qualitative: ["jbi-manual", "equator"],
  realist: ["rameses"],
  integrative: ["whittemore-knafl"],
  mixed: ["jbi-manual", "equator"],
  bibliometric: ["donthu-bibliometric"],
  critical: ["grant-booth"],
  umbrella: ["cochrane-overviews", "jbi-manual"],
  rapid: ["cochrane-rapid"],
  "systematic-search": ["prisma-s", "cochrane-search"],
  "meta-ethnography": ["emerge"],
  thematic: ["thomas-harden", "equator"],
};
