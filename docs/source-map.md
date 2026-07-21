# LitWise Source Map

Last verified: 2026-07-21 (Asia/Bangkok)

This map ties the current LitWise review guidance and statistical chooser to primary or upstream sources. It favors official method hubs, handbooks, and reporting-guideline pages over secondary summaries.

## Review Guidance

| Local surface | Claim to keep | Primary sources |
| --- | --- | --- |
| `literature-review-guide/README.md`, `literature-review-guide/app/guide-data.ts` systematic / meta-analysis / umbrella rows, `literature-review-guide/app/research-workbench.tsx` PRISMA planner | Systematic reviews should use PRISMA 2020 reporting, the PRISMA flow diagram, and the explanation-and-elaboration paper; quantitative syntheses should choose effect measures by outcome type and report uncertainty | [PRISMA 2020 statement](https://www.prisma-statement.org/prisma-2020-statement) (2020 hub), [PRISMA 2020 checklist](https://www.prisma-statement.org/prisma-2020-checklist), [PRISMA 2020 flow diagram](https://www.prisma-statement.org/prisma-2020-flow-diagram), [PRISMA 2020 explanation and elaboration](https://www.prisma-statement.org/prisma-2020-explanation-elaboration), [Cochrane Handbook current version 6.5](https://training.cochrane.org/handbook/current) -> Chapter 6 on effect measures, Chapter 10 on meta-analysis, Chapter 14 on certainty of evidence |
| `literature-review-guide/app/guide-data.ts` scoping rows, `literature-review-guide/app/i18n.ts` PRISMA-ScR references | Scoping reviews should use PRISMA-ScR, and JBI is the main methodology companion for scoping-review planning and search design | [PRISMA-ScR](https://www.prisma-statement.org/scoping) (published 2018; 20 essential items + 2 optional items), [JBI Manual for Evidence Synthesis](https://jbi-global-wiki.refined.site/space/MANUAL) (2024 edition), [JBI scoping review resources](https://jbi.global/scoping-review-network/resources), [JBI search methodology article](https://jbi.global/news/article/new-search-methodology-evidence-syntheses) |
| `literature-review-guide/app/research-tools.ts`, search-related guidance in `app/guide-data.ts` | Search reporting should be explicit about sources, search strategy, peer review, and record management; use PRISMA-S when the section is about literature searches | [PRISMA-S](https://www.equator-network.org/reporting-guidelines/prisma-s/) (2021), [EQUATOR PRISMA-S news item](https://www.equator-network.org/2021/01/28/new-guideline-for-reporting-literature-searches-in-systematic-reviews-published/), [JBI 2024 search methodology chapter](https://jbi.global/news/article/new-search-methodology-evidence-syntheses) |
| `literature-review-guide/app/guide-data.ts` appraisal and evidence-trustworthiness rows, `literature-review-guide/app/research-workbench.tsx` appraisal chooser | Appraisal is about trustworthiness, relevance, results, and bias; JBI critical appraisal tools and Cochrane risk-of-bias / GRADE are the right anchor sources | [JBI critical appraisal tools](https://jbi.global/critical-appraisal-tools), [Cochrane Handbook current version 6.5](https://training.cochrane.org/handbook/current) -> Chapter 8 on risk of bias, Chapter 14 on Summary of Findings and GRADE |
| `literature-review-guide/app/guide-data.ts` realist row, `literature-review-guide/app/i18n.ts` realist standards | Realist syntheses and realist evaluations should follow RAMESES publication/reporting and quality standards | [RAMESES Project standards page](https://www.ramesesproject.org/Standards_and_Training_materials.php) (RAMESES I outputs in 2013; RAMESES II reporting standards in 2016) |
| `literature-review-guide/app/guide-data.ts` meta-ethnography row, `literature-review-guide/app/i18n.ts` meta-ethnography references | Meta-ethnography should use eMERGe reporting guidance; the guidance is organized around reporting criteria and phases of meta-ethnography conduct | [eMERGe project home](https://emergeproject.org/), [eMERGe reporting guidance article page](https://pubmed.ncbi.nlm.nih.gov/30644123/) (2019; 19 reporting criteria) |
| `literature-review-guide/app/guide-data.ts` discipline cards and standards badges | High-level discipline standards should point to the relevant reporting-guideline index rather than implying one universal method | [EQUATOR reporting guidelines hub](https://www.equator-network.org/reporting-guidelines/), plus the method-specific pages above |

## Statistical Chooser

| Chooser slice | Claim to keep | Primary sources |
| --- | --- | --- |
| `stat-test-chooser.html` overview and rows 1-14 | The chooser should remain a guideline table, not a hard rule engine; variable type, pairing, and distribution are the first split points | [UCLA OARC: Choosing the Correct Statistical Test](https://stats.oarc.ucla.edu/other/mult-pkg/whatstat/) (general guidance; states these are only general guidelines) |
| Rows 2, 3, 4, 7, 11, 13, 14 | Use nonparametric alternatives when data are ordinal, skewed, or assumptions are weak; Mann-Whitney is the nonparametric counterpart to the t test, and Friedman covers repeated measures | [UCLA OARC WhatStat](https://stats.oarc.ucla.edu/other/mult-pkg/whatstat/), [NIST nonparametric methods](https://www.itl.nist.gov/div898/handbook/prc/section2/prc2.htm), [NIST Mann-Whitney U test](https://www.itl.nist.gov/div898/handbook/prc/section3/prc35.htm) |
| Row 2 independent-samples t test note | Welch's t test is a defensible default when variances differ; avoid relying on a pretest to choose Student vs Welch | [Delacre, Lakens, Leys (2017)](https://rips-irsp.com/articles/10.5334/irsp.82) |
| Rows 4 and 7 | Post-hoc comparisons should use simultaneous multiple-comparison procedures instead of repeating pairwise tests one by one | [NIST multiple comparisons overview](https://www.itl.nist.gov/div898/handbook/prc/section4/prc47.htm), [NIST Tukey method](https://www.itl.nist.gov/div898/handbook/prc/section4/prc471.htm), [NIST Bonferroni method](https://www.itl.nist.gov/div898/handbook/prc/section4/prc473.htm) |
| Rows 8 and 9 | Chi-square tests need sparse-cell checks; Cochran's rule still anchors the expected-count warning, and Fisher's exact test is the fallback for sparse tables | [Cochran (1954)](https://doi.org/10.2307/3001616), [UCLA OARC WhatStat](https://stats.oarc.ucla.edu/other/mult-pkg/whatstat/) |
| Row 10 | McNemar is the paired-binary test for before/after or matched binary data | [UCLA OARC WhatStat](https://stats.oarc.ucla.edu/other/mult-pkg/whatstat/) |
| Rows 11, 13, 14 | Regression is not just coefficient fitting; inspect plots and residuals, and treat logistic-regression sample size as a modeling question rather than a fixed rule | [NIST model fit and residual analysis](https://www.itl.nist.gov/div898/handbook/pmd/section4/pmd44.htm), [NIST choosing a regression function](https://www.itl.nist.gov/div898/handbook/pmd/section4/pmd422.htm), [UCLA OARC WhatStat](https://stats.oarc.ucla.edu/other/mult-pkg/whatstat/), [Vittinghoff & McCulloch (2007)](https://academic.oup.com/aje/article-abstract/165/6/710/63906) |
| Rows 13 and 14, plus meta-analysis sections in LitWise | Choose effect measures by outcome type and keep uncertainty visible; effect sizes are part of analysis design, not an afterthought | [Cochrane Handbook Chapter 6](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-06), [Cochrane Handbook Chapter 10](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-10) |

## Version Notes

- `PRISMA 2020` remains the current PRISMA baseline on the official PRISMA site; use the statement, the E&E paper, and the flow-diagram page together.
- `PRISMA-ScR` is the 2018 scoping-review extension.
- `Cochrane Handbook` current version is `6.5` (2024).
- `JBI Manual for Evidence Synthesis` is the 2024 edition and now has a dedicated search-methodology chapter.
- `eMERGe` reporting guidance was published in 2019.
- `RAMESES` realist-synthesis and realist-evaluation standards are older but still the canonical project hub for those methods.
- The UCLA `WhatStat` page is a consulting/teaching aid, not a formal reporting standard, so it is best used as the chooser backbone, not the final authority for every edge case.

## Reusable Takeaway

Use PRISMA/JBI/Cochrane for the review-method backbone, RAMESES and eMERGe for method-specific qualitative/realist reporting, and UCLA/NIST/Cochrane for the statistical chooser. Treat the chooser as a guideline table, not a rule engine.
