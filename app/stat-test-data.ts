import type { Locale } from "./i18n";
import type { ResearchSourceId } from "./research-sources";

export type LocalizedText = Record<Locale, string>;
export type StatSoftware = "SPSS" | "R" | "Python" | "Jamovi" | "Stata" | "Excel";
export type StatResultId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export type StatTreeOption = LocalizedText & {
  id: string;
  hint?: LocalizedText;
  next?: string;
  result?: StatResultId;
};

export type StatTreeNode = {
  question: LocalizedText;
  options: readonly StatTreeOption[];
};

export type StatRecommendation = {
  id: StatResultId;
  name: LocalizedText;
  useCase: LocalizedText;
  assumptions: LocalizedText;
  caution?: LocalizedText;
  alternative?: { name: string; reason: LocalizedText };
  commands: Record<StatSoftware, string>;
  sourceIds: readonly ResearchSourceId[];
};

export const statSoftware: readonly StatSoftware[] = ["SPSS", "R", "Python", "Jamovi", "Stata", "Excel"];

export const statChooserText = {
  en: {
    index: "04",
    title: "Statistical test chooser",
    intro: "Answer a few questions to find a sensible starting point, then check the assumptions, study design, and reporting guidance before running the analysis.",
    cautionTitle: "Use this as a starting point",
    caution: "The tree covers common introductory analyses. It does not replace advice for clustered or longitudinal data, mixed models, survival or count outcomes, missing data, causal inference, or complex sampling.",
    start: "Start",
    step: "Question",
    assumptions: "Check before using",
    alternative: "Possible alternative",
    note: "Interpretation note",
    commands: "Where to run it",
    commandNote: "Menu paths and commands can change. Check the documentation for your software version before using them in a real analysis.",
    restart: "Start over",
    all: "Browse all 14 techniques",
    allIntro: "You can open a technique directly if you already know what you need.",
    open: "Open recommendation",
  },
  th: {
    index: "04",
    title: "ตัวช่วยเลือกสถิติ",
    intro: "ตอบคำถามทีละข้อเพื่อหาวิธีวิเคราะห์ที่น่าจะเหมาะเป็นจุดเริ่มต้น จากนั้นตรวจข้อตกลงเบื้องต้น รูปแบบการวิจัย และแนวทางรายงานผลก่อนวิเคราะห์จริง",
    cautionTitle: "ใช้เป็นจุดเริ่มต้น ไม่ใช่คำตอบสุดท้าย",
    caution: "แผนผังนี้ครอบคลุมสถิติพื้นฐานที่ใช้บ่อย แต่ยังไม่ครอบคลุมข้อมูลที่มีโครงสร้างเป็นกลุ่ม (clustered data) หรือข้อมูลแบบติดตามระยะยาว แบบจำลองผสม การวิเคราะห์การรอดชีพ ข้อมูลจำนวนนับ ข้อมูลสูญหาย การอนุมานเชิงสาเหตุ และการสุ่มตัวอย่างที่ซับซ้อน",
    start: "เริ่มต้น",
    step: "คำถามข้อที่",
    assumptions: "สิ่งที่ต้องตรวจก่อนใช้",
    alternative: "ทางเลือกที่อาจใช้ได้",
    note: "ข้อควรระวังในการแปลผล",
    commands: "เมนูหรือคำสั่งในโปรแกรม",
    commandNote: "ชื่อเมนูและรูปแบบคำสั่งอาจเปลี่ยนไปตามรุ่นของโปรแกรม ควรตรวจคู่มือของรุ่นที่ใช้อีกครั้งก่อนวิเคราะห์ข้อมูลจริง",
    restart: "เริ่มเลือกใหม่",
    all: "ดูสถิติทั้ง 14 รายการ",
    allIntro: "หากทราบวิธีที่ต้องการอยู่แล้ว สามารถเปิดดูคำแนะนำของแต่ละรายการได้ทันที",
    open: "เปิดดูคำแนะนำ",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export const statDecisionTree: Record<string, StatTreeNode> = {
  root: {
    question: { th: "คำถามวิจัยของคุณต้องการตอบเรื่องใด", en: "What does your research question ask?" },
    options: [
      { id: "describe", th: "บรรยายลักษณะข้อมูล", en: "Describe the data", hint: { th: "ค่าเฉลี่ย ร้อยละ การกระจาย", en: "means, percentages, distributions" }, next: "desc" },
      { id: "compare", th: "เปรียบเทียบกลุ่ม", en: "Compare groups", hint: { th: "ค่าเฉลี่ยหรือสัดส่วน", en: "means or proportions" }, next: "cmp" },
      { id: "relationship", th: "หาความสัมพันธ์ระหว่างตัวแปร", en: "Examine a relationship", hint: { th: "สหสัมพันธ์หรือตารางไขว้", en: "correlation or crosstabs" }, next: "rel" },
      { id: "predict", th: "พยากรณ์ผลลัพธ์", en: "Predict an outcome", hint: { th: "การถดถอย", en: "regression" }, next: "pred" },
    ],
  },
  desc: {
    question: { th: "ตัวแปรที่ต้องการบรรยายเป็นแบบใด", en: "What type of variable are you describing?" },
    options: [
      { id: "continuous", th: "ตัวแปรเชิงปริมาณ", en: "Quantitative variable", hint: { th: "อายุ รายได้ คะแนน", en: "age, income, score" }, result: 11 },
      { id: "categorical", th: "ตัวแปรเชิงกลุ่ม", en: "Categorical variable", hint: { th: "เพศ ระดับการศึกษา", en: "gender, education level" }, result: 12 },
    ],
  },
  cmp: {
    question: { th: "ต้องการเปรียบเทียบกี่กลุ่ม", en: "How many groups are you comparing?" },
    options: [
      { id: "one", th: "1 กลุ่ม เทียบกับเกณฑ์", en: "One group against a benchmark", next: "g1" },
      { id: "two", th: "2 กลุ่ม", en: "Two groups", next: "g2" },
      { id: "three-plus", th: "ตั้งแต่ 3 กลุ่มขึ้นไป", en: "Three or more groups", next: "g3" },
    ],
  },
  g1: {
    question: { th: "ข้อมูลที่นำมาเปรียบเทียบเป็นแบบใด", en: "What are you comparing with the benchmark?" },
    options: [
      { id: "mean", th: "ค่าเฉลี่ยของข้อมูลเชิงปริมาณ", en: "A quantitative mean", result: 1 },
      { id: "binary", th: "สัดส่วนของผลลัพธ์ 2 ทาง", en: "A binary proportion", result: 6 },
      { id: "counts", th: "ความถี่ของหลายหมวดหมู่", en: "Counts across categories", result: 8 },
    ],
  },
  g2: {
    question: { th: "ข้อมูลจากสองกลุ่มสัมพันธ์กันอย่างไร", en: "How are the two groups related?" },
    options: [
      { id: "independent", th: "เป็นคนละกลุ่มและเป็นอิสระจากกัน", en: "Independent groups", next: "g2i" },
      { id: "paired", th: "เป็นกลุ่มเดียวกันที่วัดซ้ำ หรือเป็นข้อมูลจับคู่", en: "Repeated or paired observations", next: "g2p" },
    ],
  },
  g2i: {
    question: { th: "ตัวแปรตามเป็นแบบใด", en: "What type of outcome do you have?" },
    options: [
      { id: "continuous", th: "ตัวแปรเชิงปริมาณ", en: "Quantitative", result: 2 },
      { id: "categorical", th: "ตัวแปรเชิงกลุ่ม", en: "Categorical counts", result: 9 },
    ],
  },
  g2p: {
    question: { th: "ตัวแปรตามเป็นแบบใด", en: "What type of outcome do you have?" },
    options: [
      { id: "continuous", th: "ตัวแปรเชิงปริมาณ", en: "Quantitative", result: 3 },
      { id: "binary", th: "ตัวแปรเชิงกลุ่มที่มี 2 ค่า", en: "Binary categorical", result: 10 },
    ],
  },
  g3: {
    question: { th: "กลุ่มที่เปรียบเทียบมีโครงสร้างอย่างไร", en: "How are the groups structured?" },
    options: [
      { id: "one-factor", th: "กลุ่มอิสระ มีตัวแปรอิสระ 1 ตัว", en: "Independent groups with one factor", result: 4 },
      { id: "multi-factor", th: "กลุ่มอิสระ มีตัวแปรอิสระตั้งแต่ 2 ตัว", en: "Independent groups with two or more factors", result: 5 },
      { id: "repeated", th: "กลุ่มเดียวกัน วัดซ้ำตั้งแต่ 3 ครั้ง", en: "The same group measured three or more times", result: 7 },
    ],
  },
  rel: {
    question: { th: "ตัวแปรที่ต้องการหาความสัมพันธ์เป็นแบบใด", en: "What types of variables are related?" },
    options: [
      { id: "quantitative", th: "เป็นตัวแปรเชิงปริมาณทั้งคู่", en: "Both are quantitative", result: 11 },
      { id: "categorical", th: "เป็นตัวแปรเชิงกลุ่มทั้งคู่", en: "Both are categorical", result: 12 },
    ],
  },
  pred: {
    question: { th: "ผลลัพธ์ที่ต้องการพยากรณ์เป็นแบบใด", en: "What type of outcome are you predicting?" },
    options: [
      { id: "continuous", th: "ค่าต่อเนื่อง", en: "A continuous value", result: 13 },
      { id: "binary", th: "ผลลัพธ์ที่มี 2 ทาง", en: "A binary outcome", result: 14 },
    ],
  },
};

const sharedCommands = {
  oneSample: { SPSS: "Analyze → Compare Means → One-Sample T Test", R: "t.test(x, mu = 50)", Python: "from scipy import stats\nstats.ttest_1samp(x, popmean=50)", Jamovi: "T-Tests → One Sample T-Test", Stata: "ttest x == 50", Excel: "ไม่มีคำสั่ง one-sample t-test โดยตรงใน ToolPak — ควรใช้โปรแกรมสถิติ หรือคำนวณอย่างระมัดระวังจากสูตร" },
  independent: { SPSS: "Analyze → Compare Means → Independent-Samples T Test", R: "t.test(y ~ group, data = df) # Welch เป็นค่าเริ่มต้น", Python: "from scipy import stats\nstats.ttest_ind(g1, g2, equal_var=False)", Jamovi: "T-Tests → Independent Samples T-Test → Welch's", Stata: "ttest y, by(group) unequal", Excel: "=T.TEST(range1, range2, 2, 3) # two-tailed, unequal variance" },
  paired: { SPSS: "Analyze → Compare Means → Paired-Samples T Test", R: "t.test(pre, post, paired = TRUE)", Python: "stats.ttest_rel(pre, post)", Jamovi: "T-Tests → Paired Samples T-Test", Stata: "ttest pre == post", Excel: "=T.TEST(range1, range2, 2, 1)" },
} satisfies Record<string, Record<StatSoftware, string>>;

export const statRecommendations: Record<StatResultId, StatRecommendation> = {
  1: {
    id: 1,
    name: { th: "One-sample t-test", en: "One-sample t-test" },
    useCase: { th: "เปรียบเทียบค่าเฉลี่ยของกลุ่มตัวอย่างหนึ่งกลุ่มกับค่ามาตรฐานหรือเกณฑ์ที่กำหนด", en: "Compare one sample mean with a known benchmark." },
    assumptions: { th: "ตัวอย่างเป็นอิสระ ตัวแปรเป็นเชิงปริมาณ และข้อมูลหรือเศษเหลือไม่เบี่ยงเบนจากการแจกแจงปกติมากเกินไป", en: "Independent observations, a quantitative outcome, and data or residuals without severe departure from normality." },
    caution: { th: "Wilcoxon signed-rank ทดสอบตำแหน่งของการแจกแจงภายใต้เงื่อนไขเรื่องความสมมาตร จึงไม่ควรเขียนว่าเป็นการทดสอบค่าเฉลี่ยหรือมัธยฐานโดยอัตโนมัติ", en: "Wilcoxon signed-rank concerns a distributional location shift and needs symmetry for a median interpretation; it is not automatically a test of the mean or median." },
    alternative: { name: "Wilcoxon signed-rank", reason: { th: "ข้อมูลเป็นอันดับหรือเบ้มาก โดยตรวจเงื่อนไขของการทดสอบทางเลือกแล้ว", en: "ordinal or strongly skewed data, after checking the alternative's own assumptions" } },
    commands: sharedCommands.oneSample,
    sourceIds: ["ucla-stat-choice", "r-stats", "scipy-stats"],
  },
  2: {
    id: 2,
    name: { th: "Welch’s independent-samples t-test", en: "Welch’s independent-samples t-test" },
    useCase: { th: "เปรียบเทียบค่าเฉลี่ยของสองกลุ่มที่เป็นอิสระจากกัน", en: "Compare means between two independent groups." },
    assumptions: { th: "แต่ละหน่วยสังเกตเป็นอิสระ ตัวแปรตามเป็นเชิงปริมาณ และการแจกแจงของข้อมูลภายในแต่ละกลุ่มไม่เบี่ยงเบนจากการแจกแจงปกติมากเกินไป", en: "Independent observations, a quantitative outcome, and no severe distributional problems within groups." },
    caution: { th: "เลือก Welch เป็นค่าเริ่มต้นได้เมื่อไม่มั่นใจว่าความแปรปรวนเท่ากัน และไม่จำเป็นต้องทดสอบ Levene ก่อนเพื่อเลือกสูตร t-test", en: "Welch's version is a robust default when equal variances are uncertain; a preliminary Levene test is not required to choose the formula." },
    alternative: { name: "Mann–Whitney U", reason: { th: "ข้อมูลเป็นอันดับหรือมีการกระจายที่ทำให้ t-test ไม่เหมาะ ทั้งนี้การแปลผลเป็นความต่างของมัธยฐานต้องมีเงื่อนไขเพิ่มเติม", en: "ordinal data or distributions unsuitable for a t-test; a median interpretation requires additional shape assumptions" } },
    commands: sharedCommands.independent,
    sourceIds: ["delacre-welch", "ucla-stat-choice", "r-stats", "scipy-stats"],
  },
  3: {
    id: 3,
    name: { th: "Paired-samples t-test", en: "Paired-samples t-test" },
    useCase: { th: "เปรียบเทียบค่าเฉลี่ยของข้อมูลก่อน–หลัง หรือข้อมูลสองชุดที่จับคู่กัน", en: "Compare two means from repeated or genuinely paired observations." },
    assumptions: { th: "แต่ละคู่สัมพันธ์กัน แต่คู่หนึ่งเป็นอิสระจากอีกคู่ และค่าผลต่างของแต่ละคู่มีการแจกแจงใกล้ปกติ", en: "Observations are paired, pairs are independent of one another, and paired differences are approximately normal." },
    caution: { th: "ตรวจการแจกแจงของค่าผลต่าง ไม่ใช่ตรวจคะแนนก่อนและหลังแยกกัน", en: "Assess the distribution of paired differences, not the two raw score distributions separately." },
    alternative: { name: "Wilcoxon signed-rank", reason: { th: "ผลต่างเป็นอันดับหรือเบ้มาก และผ่านเงื่อนไขของวิธีทางเลือก", en: "ordinal or strongly skewed differences, after checking its assumptions" } },
    commands: sharedCommands.paired,
    sourceIds: ["ucla-stat-choice", "r-stats", "scipy-stats"],
  },
  4: {
    id: 4,
    name: { th: "One-way ANOVA", en: "One-way ANOVA" },
    useCase: { th: "เปรียบเทียบค่าเฉลี่ยตั้งแต่สามกลุ่มขึ้นไป โดยมีตัวแปรอิสระหนึ่งตัว", en: "Compare means across three or more independent groups with one factor." },
    assumptions: { th: "หน่วยสังเกตเป็นอิสระ เศษเหลือใกล้ปกติ และตรวจความแปรปรวนระหว่างกลุ่ม; หากไม่เท่ากันให้พิจารณา Welch ANOVA", en: "Independent observations, approximately normal residuals, and assessed group variances; consider Welch ANOVA when variances differ." },
    caution: { th: "ผล ANOVA ที่มีนัยสำคัญยังไม่บอกว่าคู่ใดต่างกัน ต้องวางแผนเปรียบเทียบหรือทำ post-hoc ที่เหมาะสม", en: "A significant omnibus test does not identify which groups differ; use planned contrasts or an appropriate post-hoc procedure." },
    alternative: { name: "Kruskal–Wallis", reason: { th: "ข้อมูลเป็นอันดับหรือไม่เหมาะกับแบบจำลอง ANOVA", en: "ordinal data or data unsuitable for the ANOVA model" } },
    commands: { SPSS: "Analyze → Compare Means → One-Way ANOVA", R: "fit <- aov(y ~ group, data = df)\nsummary(fit); TukeyHSD(fit)", Python: "stats.f_oneway(g1, g2, g3)\n# post-hoc: statsmodels.stats.multicomp", Jamovi: "ANOVA → One-Way ANOVA", Stata: "oneway y group, tabulate", Excel: "Data Analysis → ANOVA: Single Factor" },
    sourceIds: ["penn-anova", "r-stats", "scipy-stats"],
  },
  5: {
    id: 5,
    name: { th: "Factorial ANOVA / general linear model", en: "Factorial ANOVA / general linear model" },
    useCase: { th: "เปรียบเทียบค่าเฉลี่ยเมื่อมีตัวแปรอิสระตั้งแต่สองตัว และต้องการตรวจปฏิสัมพันธ์ระหว่างตัวแปร", en: "Compare means with two or more factors and test their interactions." },
    assumptions: { th: "หน่วยสังเกตเป็นอิสระ เศษเหลือใกล้ปกติ ความแปรปรวนเหมาะสม และมีข้อมูลเพียงพอในแต่ละเซลล์ของการออกแบบ", en: "Independent observations, approximately normal residuals, suitable variance structure, and adequate data in each design cell." },
    caution: { th: "หากปฏิสัมพันธ์ (interaction) มีนัยสำคัญ ควรแปลผลจากอิทธิพลอย่างง่าย (simple effects) หรือค่าเฉลี่ยส่วนเพิ่มที่ประมาณได้ (estimated marginal means) แทนการดูอิทธิพลหลักเพียงอย่างเดียว", en: "When an interaction is meaningful, interpret simple effects or estimated marginal means rather than main effects alone." },
    commands: { SPSS: "Analyze → General Linear Model → Univariate", R: "fit <- aov(y ~ A * B, data = df)\nsummary(fit)", Python: "fit = smf.ols('y ~ C(A) * C(B)', data=df).fit()\nsm.stats.anova_lm(fit, typ=2)", Jamovi: "ANOVA → ANOVA → add factors and interaction", Stata: "anova y A##B", Excel: "รองรับเฉพาะการออกแบบพื้นฐานบางแบบใน ToolPak — งาน factorial ที่ซับซ้อนควรใช้โปรแกรมสถิติ" },
    sourceIds: ["penn-anova", "r-stats"],
  },
  6: {
    id: 6,
    name: { th: "Binomial test", en: "Binomial test" },
    useCase: { th: "ทดสอบว่าสัดส่วนของผลลัพธ์สองทางต่างจากค่าที่กำหนดหรือไม่", en: "Test whether a binary proportion differs from a specified value." },
    assumptions: { th: "ผลลัพธ์มีสองทาง การสังเกตเป็นอิสระ และความน่าจะเป็นของผลลัพธ์คงที่ในแต่ละครั้ง", en: "Two possible outcomes, independent trials, and a constant success probability across trials." },
    caution: { th: "เป็นการทดสอบแบบคำนวณค่าที่แน่นอน (exact test) จึงใช้กับตัวอย่างขนาดเล็กได้ แต่ยังต้องตรวจว่าหน่วยสังเกตเป็นอิสระจริง", en: "It is an exact test and can suit small samples, but independence of trials still matters." },
    commands: { SPSS: "Analyze → Nonparametric Tests → Legacy Dialogs → Binomial", R: "binom.test(45, 100, p = 0.5)", Python: "stats.binomtest(45, 100, p=0.5)", Jamovi: "Frequencies → 2 Outcomes (Binomial)", Stata: "bitest x == 0.5", Excel: "=BINOM.DIST(...) # คำนวณความน่าจะเป็น; ต้องประกอบ p-value ให้ตรงสมมติฐาน" },
    sourceIds: ["ucla-stat-choice", "r-stats", "scipy-stats"],
  },
  7: {
    id: 7,
    name: { th: "Repeated-measures ANOVA / Friedman test", en: "Repeated-measures ANOVA / Friedman test" },
    useCase: { th: "เปรียบเทียบค่าที่วัดซ้ำตั้งแต่สามครั้งขึ้นไปในหน่วยตัวอย่างเดียวกัน", en: "Compare three or more measurements taken from the same units." },
    assumptions: { th: "ข้อมูลเชื่อมโยงกับหน่วยตัวอย่างถูกต้อง เศษเหลือเป็นไปตามข้อตกลงเบื้องต้น และสำหรับการวิเคราะห์ความแปรปรวนแบบวัดซ้ำ (repeated-measures ANOVA) ต้องตรวจภาวะทรงกลม (sphericity) หรือใช้วิธีปรับแก้", en: "Measurements are correctly linked by subject, residual assumptions are suitable, and sphericity is checked or corrected for repeated-measures ANOVA." },
    caution: { th: "หากมีข้อมูลหาย ช่วงเวลาวัดไม่เท่ากัน หรือต้องการตัวแปรร่วม แบบจำลองผสมมักเหมาะกว่าวิธีพื้นฐานนี้", en: "Mixed models are often preferable when data are missing, intervals vary, or covariates and flexible covariance structures are needed." },
    alternative: { name: "Friedman test", reason: { th: "ข้อมูลอย่างน้อยเป็นอันดับ วัดครบทุกช่วง และไม่เหมาะกับการวิเคราะห์ความแปรปรวนแบบวัดซ้ำ", en: "at least ordinal, complete repeated data unsuitable for repeated-measures ANOVA" } },
    commands: { SPSS: "Analyze → General Linear Model → Repeated Measures", R: "friedman.test(as.matrix(df[c('t1','t2','t3')]))", Python: "stats.friedmanchisquare(t1, t2, t3)", Jamovi: "ANOVA → Repeated Measures ANOVA", Stata: "mixed y i.time || id: # flexible repeated-measures model", Excel: "ไม่มี repeated-measures ANOVA โดยตรง — ไม่ควรใช้ Two-Factor Without Replication แทนโดยอัตโนมัติ" },
    sourceIds: ["penn-anova", "r-stats", "scipy-stats"],
  },
  8: {
    id: 8,
    name: { th: "Chi-square goodness-of-fit test", en: "Chi-square goodness-of-fit test" },
    useCase: { th: "ทดสอบว่าความถี่ที่พบในแต่ละหมวดต่างจากความถี่ที่คาดไว้หรือไม่", en: "Test whether observed category counts differ from expected counts." },
    assumptions: { th: "ใช้จำนวนนับ การสังเกตเป็นอิสระ และตรวจความถี่คาดหวัง; แนวทางที่ใช้บ่อยคืออย่างน้อย 80% ของเซลล์มีค่าคาดหวังตั้งแต่ 5 และไม่มีเซลล์ต่ำกว่า 1", en: "Use counts and independent observations; commonly, at least 80% of expected counts should be 5 or more and none below 1." },
    caution: { th: "หากค่าคาดหวังต่ำ ควรรวมหมวดหมู่อย่างมีเหตุผล หรือใช้วิธีคำนวณค่าที่แน่นอนหรือวิธีมอนติคาร์โล (exact/Monte Carlo method) ที่เหมาะสม", en: "For sparse expected counts, combine categories only with substantive justification or use a suitable exact or Monte Carlo method." },
    commands: { SPSS: "Analyze → Nonparametric Tests → Legacy Dialogs → Chi-Square", R: "chisq.test(c(30, 25, 45), p=c(1/3, 1/3, 1/3))", Python: "stats.chisquare([30, 25, 45])", Jamovi: "Frequencies → N Outcomes", Stata: "tabulate category, chi2", Excel: "=CHISQ.TEST(observed_range, expected_range)" },
    sourceIds: ["cochran-chi-square", "r-stats", "scipy-stats"],
  },
  9: {
    id: 9,
    name: { th: "Chi-square test of independence", en: "Chi-square test of independence" },
    useCase: { th: "ทดสอบความสัมพันธ์ระหว่างตัวแปรเชิงกลุ่มสองตัว", en: "Test association between two categorical variables." },
    assumptions: { th: "การสังเกตเป็นอิสระ และความถี่คาดหวังเพียงพอ; แนวทางที่ใช้บ่อยคืออย่างน้อย 80% ของเซลล์มีค่าคาดหวังตั้งแต่ 5 และไม่มีเซลล์ต่ำกว่า 1", en: "Independent observations and adequate expected counts; commonly, at least 80% of cells should have expected counts of 5 or more and none below 1." },
    caution: { th: "หากเป็นข้อมูลก่อน–หลังในคนเดิม ให้ใช้การทดสอบ McNemar ไม่ใช่การทดสอบไคสแควร์สำหรับข้อมูลอิสระ", en: "For paired before-and-after binary data, use McNemar rather than the independent chi-square test." },
    alternative: { name: "Fisher’s exact test", reason: { th: "ตารางมีขนาดเล็กหรือความถี่คาดหวังไม่เพียงพอ", en: "small tables or inadequate expected counts" } },
    commands: { SPSS: "Analyze → Descriptive Statistics → Crosstabs → Statistics → Chi-square", R: "chisq.test(table(df$a, df$b))", Python: "stats.chi2_contingency(pd.crosstab(df.a, df.b))", Jamovi: "Frequencies → Independent Samples → χ²", Stata: "tabulate a b, chi2 exact", Excel: "=CHISQ.TEST(observed_range, expected_range)" },
    sourceIds: ["cochran-chi-square", "ucla-stat-choice", "r-stats", "scipy-stats"],
  },
  10: {
    id: 10,
    name: { th: "McNemar test", en: "McNemar test" },
    useCase: { th: "ทดสอบการเปลี่ยนแปลงของผลลัพธ์สองทางจากข้อมูลที่จับคู่กัน เช่น ก่อน–หลังในคนเดิม", en: "Test change in a paired binary outcome, such as before and after in the same participants." },
    assumptions: { th: "ข้อมูลเป็นคู่ ผลลัพธ์มีสองทาง คู่แต่ละคู่เป็นอิสระจากคู่อื่น และเลือกสูตร exact เมื่อคู่ที่ให้ผลต่างกันมีจำนวนน้อย", en: "Paired binary outcomes, independent pairs, and an exact version when discordant pairs are sparse." },
    caution: { th: "การทดสอบใช้ข้อมูลจากคู่ที่ผลเปลี่ยนไปเป็นหลัก จึงควรรายงานตาราง 2×2 ควบคู่กับผลทดสอบ", en: "The test is driven by discordant pairs, so report the paired 2×2 table alongside the test." },
    commands: { SPSS: "Analyze → Nonparametric Tests → Related Samples → McNemar", R: "mcnemar.test(table(before, after))", Python: "from statsmodels.stats.contingency_tables import mcnemar\nmcnemar(table, exact=True)", Jamovi: "Frequencies → Paired Samples → McNemar", Stata: "mcc before after", Excel: "ไม่มีคำสั่งโดยตรง — ควรใช้โปรแกรมสถิติที่รองรับ exact McNemar" },
    sourceIds: ["ucla-stat-choice", "r-stats"],
  },
  11: {
    id: 11,
    name: { th: "สถิติบรรยายและสหสัมพันธ์", en: "Descriptive statistics and correlation" },
    useCase: { th: "สรุปลักษณะของข้อมูลเชิงปริมาณ หรือวัดทิศทางและระดับความสัมพันธ์ระหว่างตัวแปรสองตัว", en: "Summarize quantitative data or measure the direction and strength of association between two variables." },
    assumptions: { th: "เลือกค่ากลางและการกระจายให้เหมาะกับข้อมูล Pearson ใช้กับความสัมพันธ์เชิงเส้นและควรตรวจแผนภาพการกระจาย (scatterplot) ส่วน Spearman เหมาะกับข้อมูลอันดับหรือความสัมพันธ์ที่เพิ่มหรือลดไปในทิศทางเดียว (monotonic)", en: "Choose summaries that fit the distribution; Pearson targets linear association and should be paired with a scatterplot, while Spearman suits ordinal or monotonic relationships." },
    caution: { th: "ค่าสหสัมพันธ์ไม่ได้ยืนยันความเป็นเหตุเป็นผล และค่าเดียวกันอาจซ่อนรูปแบบข้อมูลที่ต่างกันมาก", en: "Correlation does not establish causation, and the same coefficient can hide very different data patterns." },
    alternative: { name: "Spearman’s rho", reason: { th: "ข้อมูลเป็นอันดับ หรือความสัมพันธ์เพิ่มหรือลดไปในทิศทางเดียวแต่ไม่เป็นเส้นตรง", en: "ordinal data or a monotonic but non-linear relationship" } },
    commands: { SPSS: "Analyze → Descriptive Statistics / Correlate → Bivariate", R: "summary(df)\ncor.test(x, y, method='pearson')", Python: "df.describe()\nstats.pearsonr(x, y)", Jamovi: "Exploration → Descriptives; Regression → Correlation Matrix", Stata: "summarize x y\npwcorr x y, sig", Excel: "=AVERAGE()  =STDEV.S()  =CORREL(range1, range2)" },
    sourceIds: ["penn-correlation", "r-stats", "scipy-stats"],
  },
  12: {
    id: 12,
    name: { th: "ตารางแจกแจงความถี่และตารางไขว้", en: "Frequencies and crosstabs" },
    useCase: { th: "สรุปจำนวน ร้อยละ และการกระจายของตัวแปรเชิงกลุ่ม", en: "Summarize counts, percentages, and distributions of categorical variables." },
    assumptions: { th: "กำหนดตัวหารของร้อยละและวิธีจัดการข้อมูลสูญหายให้ชัดเจน และแยกการบรรยายออกจากการทดสอบสมมติฐาน", en: "Define percentage denominators and missing-data handling clearly, and separate description from inference." },
    caution: { th: "ตารางไขว้ช่วยให้เห็นรูปแบบเบื้องต้น แต่ยังสรุปไม่ได้ว่าตัวแปรสัมพันธ์กันอย่างมีนัยสำคัญ", en: "A crosstab reveals patterns but does not by itself establish a statistically supported association." },
    commands: { SPSS: "Analyze → Descriptive Statistics → Frequencies / Crosstabs", R: "table(df$a)\nprop.table(table(df$a, df$b), margin=1)", Python: "df.a.value_counts(dropna=False)\npd.crosstab(df.a, df.b, normalize='index')", Jamovi: "Exploration → Descriptives → Frequency tables", Stata: "tabulate a\ntabulate a b, row", Excel: "PivotTable หรือ COUNTIF/COUNTIFS" },
    sourceIds: ["ucla-stat-choice", "r-stats"],
  },
  13: {
    id: 13,
    name: { th: "การถดถอยเชิงเส้น", en: "Linear regression" },
    useCase: { th: "ประมาณหรือพยากรณ์ค่าตัวแปรตามแบบต่อเนื่องจากตัวแปรอิสระหนึ่งตัวหรือหลายตัว", en: "Estimate or predict a continuous outcome from one or more predictors." },
    assumptions: { th: "กำหนดรูปแบบความสัมพันธ์ระหว่างตัวแปรได้อย่างเหมาะสม เศษเหลือเป็นอิสระ มีความแปรปรวนคงที่ และไม่มีภาวะร่วมเส้นตรงหลายตัวแปร (multicollinearity) ที่รุนแรง ควรตรวจกราฟวินิจฉัยของแบบจำลองด้วย", en: "Correct functional form, independent errors, constant error variance, and no severe multicollinearity; inspect model diagnostics." },
    caution: { th: "การแจกแจงปกติที่เกี่ยวข้องกับการอนุมานคือการแจกแจงของเศษเหลือ ไม่ใช่กำหนดให้ตัวแปรทุกตัวต้องแจกแจงปกติ", en: "For standard inference, normality concerns the residuals; it does not require every variable to be normally distributed." },
    commands: { SPSS: "Analyze → Regression → Linear", R: "fit <- lm(y ~ x1 + x2, data=df)\nsummary(fit); plot(fit)", Python: "fit = smf.ols('y ~ x1 + x2', data=df).fit()\nfit.summary()", Jamovi: "Regression → Linear Regression", Stata: "regress y x1 x2\nrvfplot", Excel: "Data Analysis → Regression # การวินิจฉัยมีข้อจำกัด" },
    sourceIds: ["penn-correlation", "r-stats"],
  },
  14: {
    id: 14,
    name: { th: "การถดถอยโลจิสติก", en: "Logistic regression" },
    useCase: { th: "ประมาณความน่าจะเป็นของผลลัพธ์สองทางจากตัวแปรอิสระหนึ่งตัวหรือหลายตัว", en: "Estimate the probability of a binary outcome from one or more predictors." },
    assumptions: { th: "ผลลัพธ์มีสองทาง หน่วยสังเกตเป็นอิสระ ตัวแปรต่อเนื่องสัมพันธ์เชิงเส้นกับลอจิต (logit) ไม่มีภาวะร่วมเส้นตรงหลายตัวแปรที่รุนแรง และมีจำนวนเหตุการณ์เพียงพอต่อความซับซ้อนของแบบจำลอง", en: "Binary outcome, independent observations, linearity of continuous predictors with the logit, no severe multicollinearity, and enough events for model complexity." },
    caution: { th: "กฎ 10 เหตุการณ์ต่อตัวแปรเป็นเพียงแนวทางคร่าว ๆ ควรพิจารณาขนาดตัวอย่าง ความชุก ปัญหาการแยกข้อมูลอย่างสมบูรณ์หรือเกือบสมบูรณ์ (complete/quasi-complete separation) การปรับโทษความซับซ้อนของแบบจำลอง (regularization) และการตรวจสอบความเที่ยงตรงร่วมกัน", en: "Ten events per variable is only a rough guideline; consider sample size, prevalence, separation, regularization, and model validation together." },
    commands: { SPSS: "Analyze → Regression → Binary Logistic", R: "fit <- glm(y ~ x1 + x2, family=binomial, data=df)\nsummary(fit); exp(coef(fit))", Python: "fit = smf.logit('y ~ x1 + x2', data=df).fit()\nfit.summary()", Jamovi: "Regression → 2 Outcomes → Binomial Logistic", Stata: "logistic y x1 x2", Excel: "ไม่มี logistic regression ใน ToolPak — ควรใช้โปรแกรมสถิติ" },
    sourceIds: ["vittinghoff-epv", "r-stats"],
  },
};

export function resolveStatChoice(nodeId: string, optionId: string): { next?: string; result?: StatResultId } | undefined {
  const option = statDecisionTree[nodeId]?.options.find((candidate) => candidate.id === optionId);
  if (!option) return undefined;
  return option.result ? { result: option.result } : { next: option.next };
}
