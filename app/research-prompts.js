export const researchAnalysisPrompts = /** @type {const} */ ({
  en: [
    {
      id: "paper-summary",
      title: "Summarize one research paper",
      bestFor: "Understanding a paper's question, design, results, limits, and contribution before deciding how it fits your review.",
      prompt: `Context:
I will provide one research paper about [topic]. I need the summary for [coursework, a thesis chapter, screening, or another purpose].

Task:
Summarize the paper in clear language without losing academic accuracy. Explain its objective, research questions, methodology, sample or dataset, analytical approach, key findings, limitations, conclusions, and contribution to the literature.

Evidence rules:
- Use only the paper I provide. Do not add facts from memory or other sources.
- Give the page, table, figure, or section for important findings and statistics when it is available.
- Write "not reported" when the paper does not provide an item; do not infer missing details.
- Separate the authors' claims from your interpretation, and distinguish statistical significance from practical importance.
- Do not treat the authors' conclusion as stronger than the design and results support.

Output:
Provide: 1) a plain-language overview, 2) a structured summary of objective, question, design, sample/data, analysis, findings, limitations, and conclusion, 3) the strongest supporting evidence and important statistics, 4) academic and practical implications, and 5) future research proposed by the authors, followed by additional recommendations that logically follow from the reported findings and limitations. Label your recommendations as interpretation rather than the authors' claims. End with a one-sentence takeaway whose strength stays within the evidence.`,
    },
    {
      id: "literature-review",
      title: "Draft a thematic literature review",
      bestFor: "Organizing a supplied set of papers by themes, debates, trends, and gaps instead of writing one summary per paper.",
      prompt: `Context:
I will provide [number] papers or verified extraction notes about [topic]. The review should address [review question] for [discipline, audience, or purpose].

Task:
Analyze the supplied studies and draft a literature review organized by themes. Identify recurring findings, major debates, conflicting evidence, research trends, strengths and weaknesses of the literature, the current state of knowledge, and research gaps.

Evidence rules:
- Use only the papers or extraction notes I provide.
- Attach each synthesis claim to the relevant study IDs and source locations when available.
- Distinguish consensus from a finding reported by only one or two studies.
- Explain important differences in design, population, context, and measurement before calling results contradictory.
- Do not invent references or treat "not found in this set" as proof that no research exists.

Output:
Begin with the scope and organizing logic. Write one section per theme, comparing studies within each section rather than listing them. Include a table of theme | supporting studies | conflicting or limiting evidence | limits and reasons a conclusion may remain uncertain. Conclude with the state of knowledge, defensible gaps, implications, and priorities for future research.`,
    },
    {
      id: "evidence-synthesis",
      title: "Synthesize evidence across studies",
      bestFor: "Combining findings into one evidence-based account while showing consensus, disagreement, and differences in evidential strength.",
      prompt: `Context:
I will provide [papers, extraction table, or appraisal records] about [topic] to answer [review question].

Task:
Synthesize the findings into a single evidence-based report. Group similar findings, identify consensus and disagreement, and explain what the studies collectively add to understanding of the topic.

Evidence rules:
- Use only the supplied material and cite the study ID for every synthesized finding.
- Judge strength using relevant features such as study design, risk of bias, consistency, precision, directness, sample adequacy, and context—not publication count alone.
- Explain the criteria used for labels such as stronger, limited, or uncertain evidence.
- Do not statistically pool results unless the data and methods justify a meta-analysis.
- Preserve important differences in population, intervention or exposure, outcome, and setting.

Output:
Create an evidence map with: finding | supporting studies | opposing or limiting evidence | strength and reason | applicability. Follow it with a narrative synthesis of consensus, disagreement, uncertainty, and contribution. End with the most defensible insights, practical implications, and research priorities.`,
    },
    {
      id: "research-comparison",
      title: "Compare research studies",
      bestFor: "Examining similarities, differences, conflicting results, and relative evidential strength after the basic study details have been extracted.",
      prompt: `Context:
I will provide [number] research papers about [topic]. I want to compare them in relation to [review question or decision].

Task:
Compare the studies' objectives, methodologies, samples, data sources, analytical methods, findings, limitations, and overall contributions. Identify similarities, differences, agreement, and conflicting results.

Evidence rules:
- Use only the supplied papers and name the study ID in every row.
- Write "not reported" for missing information and do not fill gaps by inference.
- Check whether apparently conflicting findings used comparable populations, measures, analyses, and contexts.
- Assess evidence strength using explicit, design-appropriate criteria; do not rank studies by sample size or journal prestige alone.
- Give source locations for important judgements when available.

Output:
Build a table with: study | objective | design and method | sample/data | analysis | key finding | limitation | contribution | evidence-strength judgement and reason. Then explain the main similarities, meaningful differences, conflicts, areas of agreement, and which studies offer the most credible evidence for [question] and why.`,
    },
    {
      id: "methodology-evaluation",
      title: "Evaluate research methodology",
      bestFor: "Assessing how design, sampling, data collection, and analysis affect the credibility and reproducibility of a study's findings.",
      prompt: `Context:
I will provide [one or more papers] about [topic]. The relevant study designs are [designs, if known], and the evaluation will inform [review, proposal, or decision].

Task:
Evaluate each study's methodology, including design, sampling, data collection, analytical techniques, validity or trustworthiness, reliability or dependability, reproducibility, and potential sources of bias. Explain how each choice affects the credibility of the findings.

Evidence rules:
- Evaluate each method against its research question and study design; do not apply one universal standard to every design.
- Distinguish poor reporting from confirmed poor conduct.
- Support every judgement with information and a source location from the paper.
- Write "cannot judge from the report" when details are insufficient.
- Do not calculate an overall quality score unless a named appraisal tool requires and defines one.

Output:
For each study, report: methodological choice | what was done | strength | concern or bias | effect on interpretation | source location | possible improvement. Finish with what conclusions the methodology can and cannot support and practical recommendations for future studies.`,
    },
    {
      id: "research-gap-analysis",
      title: "Identify research gaps",
      bestFor: "Generating and prioritizing possible evidence, population, context, method, theory, and contradiction gaps from a bounded corpus.",
      prompt: `Context:
My current corpus covers [topic, databases, date range, languages, populations, and inclusion criteria]. I want to identify research opportunities relevant to [discipline, population, or decision].

Task:
Review the supplied papers and identify unanswered questions, inconsistent findings, methodological limitations, underrepresented populations or contexts, and emerging topics that may need further investigation.

Evidence rules:
- Treat every proposed gap as provisional and bounded by the search coverage I describe.
- Do not equate "few studies" with an important gap; explain the consequence of not knowing.
- Trace each proposed gap to the relevant studies, search records, or missing comparison in the corpus.
- Distinguish evidence, population, context, methodological, theoretical, contradiction, and search-coverage gaps.
- State what additional search or expert check is needed before claiming that a gap exists.

Output:
Create a table with: proposed gap | gap type | supporting evidence | counter-evidence | why it matters | current status [supported by this corpus | further searching needed | not yet defensible] and reason | verification needed | feasible research question. Rank the gaps by importance and feasibility using explicit criteria, then write cautious recommendations for future research.`,
    },
    {
      id: "theoretical-framework",
      title: "Map theories and conceptual frameworks",
      bestFor: "Understanding how theories, frameworks, models, and constructs across the supplied literature relate and where theory could be developed.",
      prompt: `Context:
I will provide papers about [topic] from [discipline or disciplines]. I need a theoretical map to support [review question, conceptual framework, or study design].

Task:
Identify the theories, conceptual frameworks, models, and key constructs explicitly used in the papers. Explain how they relate, overlap, differ, and contribute to understanding the topic. Identify influential frameworks and opportunities for theoretical development.

Evidence rules:
- Distinguish a theory, conceptual framework, model, and individual construct; preserve the authors' own terminology.
- Do not label a framework as influential from frequency in this small corpus alone.
- For every theory or relationship, cite the study and source location where it is defined or used.
- Mark relationships that are your proposed interpretation rather than an explicit claim in the papers.
- Do not invent definitions, originators, or citations.

Output:
Provide: 1) a table of theory/framework | core constructs | proposed relationships | papers using it | role in each study | source location, 2) a comparison of overlaps, differences, and tensions, 3) an integrated conceptual map described in words, and 4) well-supported opportunities for theoretical refinement or integration.`,
    },
    {
      id: "critical-appraisal",
      title: "Critically appraise research evidence",
      bestFor: "Judging the overall credibility of evidence and conclusions with criteria appropriate to each study design.",
      prompt: `Context:
I will provide [papers] about [topic] and, if available, the appraisal standard I must use: [tool or reporting guideline]. The appraisal will inform [review question or decision].

Task:
Critically appraise the quality of the evidence, methodological rigor, validity of the conclusions, potential biases, underlying assumptions, and acknowledged limitations. Explain what each study can and cannot support.

Evidence rules:
- Use criteria appropriate to each study design and name the framework used.
- Support every judgement with evidence and a source location from the paper.
- Distinguish risk of bias, reporting completeness, relevance, and certainty; do not collapse them into one impression.
- Do not infer that a study is high quality because it is published in a prestigious journal.
- Write "insufficient information to judge" when reporting is incomplete.

Output:
For each study, provide: appraisal domain | judgement | evidence from the paper | effect on credibility | unresolved question. Then give an overall assessment [higher credibility | some concerns | major concerns | cannot judge], explain the reasoning, compare credibility across studies without using a simplistic score, and state how the appraisal should affect the synthesis.`,
    },
    {
      id: "citation-network",
      title: "Map a citation network",
      bestFor: "Finding foundational studies, influential authors, intellectual lineages, and potentially missing work from supplied references or citation data.",
      prompt: `Context:
I will provide [full papers or citation-context excerpts, together with reference lists, bibliographic records, or citation-export data] about [topic]. The data cover [databases, years, and retrieval date].

Task:
Analyze the citation network to identify foundational studies, landmark publications, influential authors, frequently used theories, clusters of related work, and bridges between clusters. When full papers or citation-context excerpts are available, explain how key cited works shaped the questions, concepts, methods, or interpretations in the current papers. Flag important or recent studies that may be missing from the supplied discussion.

Evidence rules:
- Base network claims only on the citation data I provide and state its coverage limits.
- If I provide only bibliographic or network data, do not infer intellectual influence; write "cannot determine without citation context" and identify the full text or excerpt needed.
- Distinguish references cited by a paper from later papers that cite it.
- Do not equate citation count with quality, current validity, or positive support.
- Mark self-citation, duplicate records, and name ambiguity when detectable.
- Treat a possibly missing study as a search lead, not a confirmed omission, until it is verified in an external database.

Output:
Provide: 1) a table of source | network role | links or cluster | influence on the current papers or "cannot determine" | citation-context evidence | caveat, 2) a description of the main clusters and their connections, 3) foundational and bridging works to inspect first, 4) missing-work search leads with suggested verification queries, and 5) limits caused by the supplied data and retrieval date [date].`,
    },
  ],
  th: [
    {
      id: "paper-summary",
      title: "สรุปบทความวิจัยหนึ่งเรื่อง",
      bestFor: "ทำความเข้าใจคำถาม วิธีวิจัย ผลการศึกษา ข้อจำกัด และคุณค่าของบทความ ก่อนตัดสินใจว่าจะนำไปใช้ในงานทบทวนอย่างไร",
      prompt: `บริบท:
ฉันจะให้บทความวิจัยหนึ่งเรื่องเกี่ยวกับ [หัวข้อ] และต้องการนำบทสรุปไปใช้เพื่อ [รายงานในรายวิชา/บทวิทยานิพนธ์/คัดกรองบทความ/วัตถุประสงค์อื่น]

งานที่ให้ช่วย:
สรุปบทความด้วยภาษาที่อ่านเข้าใจง่าย แต่ยังคงความถูกต้องทางวิชาการ อธิบายวัตถุประสงค์ คำถามวิจัย ระเบียบวิธี กลุ่มตัวอย่างหรือชุดข้อมูล วิธีวิเคราะห์ ผลการศึกษาหลัก ข้อจำกัด ข้อสรุป และคุณค่าที่งานนี้เพิ่มให้กับองค์ความรู้เดิม

ข้อกำหนดการใช้หลักฐาน:
- ใช้เฉพาะข้อมูลจากบทความที่ฉันให้ ห้ามเติมข้อมูลจากความจำหรือแหล่งอื่น
- เมื่อกล่าวถึงผลสำคัญหรือตัวเลข ให้ระบุหน้า ตาราง รูป หรือหัวข้อที่พบ หากเอกสารมีข้อมูลตำแหน่ง
- หากบทความไม่ระบุข้อมูล ให้เขียนว่า “ไม่รายงาน” ห้ามเติมข้อมูลที่บทความไม่ได้รายงาน
- แยกสิ่งที่ผู้เขียนกล่าวไว้ออกจากการตีความของคุณ และแยกนัยสำคัญทางสถิติออกจากความสำคัญในทางปฏิบัติ
- อย่าเขียนข้อสรุปเกินกว่าที่รูปแบบการวิจัยและผลการศึกษาจะสนับสนุนได้

รูปแบบคำตอบ:
ตอบเป็น 5 ส่วน: 1) ภาพรวมแบบอ่านง่าย 2) สรุปวัตถุประสงค์ คำถาม รูปแบบการวิจัย กลุ่มตัวอย่างหรือข้อมูล วิธีวิเคราะห์ ผล ข้อจำกัด และข้อสรุป 3) หลักฐานสำคัญพร้อมตัวเลขที่ควรรู้ 4) ประโยชน์ทางวิชาการและการนำไปใช้ และ 5) ข้อเสนอของผู้เขียนสำหรับการวิจัยในอนาคต แยกจากข้อเสนอเพิ่มเติมที่พิจารณาได้จากผลและข้อจำกัดของงาน โดยระบุให้ชัดว่าส่วนหลังเป็นการตีความ ไม่ใช่ข้อเสนอของผู้เขียน ปิดท้ายด้วยใจความสำคัญหนึ่งประโยคที่ไม่กล่าวเกินหลักฐาน`,
    },
    {
      id: "literature-review",
      title: "ร่างบททบทวนวรรณกรรมตามประเด็น",
      bestFor: "จัดเอกสารหลายเรื่องตามประเด็น ข้อถกเถียง แนวโน้ม และช่องว่าง แทนการเรียงสรุปทีละบทความ",
      prompt: `บริบท:
ฉันจะให้บทความหรือบันทึกการสกัดข้อมูลจำนวน [จำนวน] รายการเกี่ยวกับ [หัวข้อ] งานทบทวนนี้ต้องตอบ [คำถามทบทวน] สำหรับ [สาขา/กลุ่มผู้อ่าน/วัตถุประสงค์]

งานที่ให้ช่วย:
วิเคราะห์เอกสารที่ให้และร่างบททบทวนวรรณกรรมโดยจัดเนื้อหาตามประเด็น หาแนวโน้มของข้อค้นพบ ข้อถกเถียง ผลที่ไม่สอดคล้องกัน ทิศทางการวิจัย จุดแข็งและข้อจำกัดขององค์ความรู้ที่มีอยู่ รวมถึงช่องว่างที่ควรศึกษาต่อ

ข้อกำหนดการใช้หลักฐาน:
- ใช้เฉพาะบทความหรือบันทึกการสกัดข้อมูลที่ฉันให้
- ทุกข้อสรุปที่เกิดจากการสังเคราะห์ต้องระบุรหัสงานวิจัย พร้อมหน้า ตาราง หรือส่วนของบทความที่ใช้ประกอบ หากมีข้อมูล
- แยกข้อค้นพบที่หลายงานให้ผลสอดคล้องกัน ออกจากผลที่พบเพียงหนึ่งหรือสองงาน
- ก่อนบอกว่าผลขัดกัน ให้ตรวจความต่างของแบบแผนวิจัย ประชากร บริบท และวิธีวัด
- ห้ามสร้างรายการอ้างอิงขึ้นเอง และอย่าใช้คำว่า “ไม่พบในเอกสารชุดนี้” เป็นหลักฐานว่าไม่มีงานวิจัยอยู่จริง

รูปแบบคำตอบ:
เริ่มด้วยขอบเขตและหลักที่ใช้แบ่งประเด็น จากนั้นเขียนเป็นหัวข้อตามประเด็น โดยเปรียบเทียบงานวิจัยภายในแต่ละหัวข้อแทนการเรียงสรุปทีละเรื่อง เพิ่มตาราง: ประเด็น | งานที่สนับสนุน | หลักฐานที่ขัดแย้งหรือเป็นข้อจำกัด | ข้อจำกัดและเหตุผลที่ยังสรุปไม่ได้ แล้วสรุปองค์ความรู้ปัจจุบัน ช่องว่างที่หลักฐานรองรับ การนำไปใช้ และเรื่องที่ควรศึกษาต่อ`,
    },
    {
      id: "evidence-synthesis",
      title: "สังเคราะห์หลักฐานจากหลายงาน",
      bestFor: "รวมข้อค้นพบเป็นข้อสรุปเดียว โดยยังเห็นทั้งจุดที่สอดคล้อง จุดที่เห็นต่าง และน้ำหนักของหลักฐานแต่ละส่วน",
      prompt: `บริบท:
ฉันจะให้ [บทความ/ตารางสกัดข้อมูล/ผลการประเมินคุณภาพ] เกี่ยวกับ [หัวข้อ] เพื่อใช้ตอบ [คำถามทบทวน]

งานที่ให้ช่วย:
สังเคราะห์ข้อค้นพบเป็นรายงานที่อิงหลักฐาน จัดกลุ่มผลที่ใกล้เคียงกัน ระบุเรื่องที่หลักฐานสอดคล้องหรือไม่สอดคล้องกัน และอธิบายว่างานทั้งหมดช่วยให้เราเข้าใจหัวข้อนี้เพิ่มขึ้นอย่างไร

ข้อกำหนดการใช้หลักฐาน:
- ใช้เฉพาะเอกสารที่ให้ และระบุรหัสงานวิจัยกำกับข้อค้นพบที่สังเคราะห์ทุกข้อ
- พิจารณาน้ำหนักหลักฐานจากแบบแผนวิจัย ความเสี่ยงต่ออคติ ความสอดคล้อง ความแม่นยำ ความตรงกับคำถาม ความเหมาะสมของกลุ่มตัวอย่าง และบริบท ไม่ใช่นับจำนวนบทความเพียงอย่างเดียว
- อธิบายเกณฑ์ที่ใช้เมื่อบอกว่าหลักฐานหนักแน่น มีข้อจำกัด หรือยังไม่แน่นอน
- อย่านำตัวเลขมารวมทางสถิติ หากข้อมูลและวิธีวิจัยยังไม่เหมาะสำหรับการวิเคราะห์อภิมาน
- คงรายละเอียดสำคัญของประชากร สิ่งแทรกแซงหรือปัจจัย ผลลัพธ์ และบริบทไว้ในการตีความ

รูปแบบคำตอบ:
ทำตาราง: ข้อค้นพบ | งานที่สนับสนุน | งานที่ไม่สอดคล้องหรือเป็นข้อจำกัด | น้ำหนักหลักฐานพร้อมเหตุผล | ขอบเขตการนำไปใช้ จากนั้นเขียนสรุปเรื่องที่เห็นตรงกัน เรื่องที่ยังไม่ลงรอย ความไม่แน่นอน และสิ่งที่งานชุดนี้เพิ่มให้กับองค์ความรู้ ปิดท้ายด้วยข้อสรุปที่หลักฐานรองรับ การนำไปใช้ และประเด็นวิจัยที่ควรให้ความสำคัญ`,
    },
    {
      id: "research-comparison",
      title: "เปรียบเทียบงานวิจัย",
      bestFor: "วิเคราะห์ความเหมือน ความต่าง ผลที่ขัดกัน และน้ำหนักหลักฐาน หลังจากมีข้อมูลพื้นฐานของแต่ละงานครบแล้ว",
      prompt: `บริบท:
ฉันจะให้บทความวิจัยจำนวน [จำนวน] เรื่องเกี่ยวกับ [หัวข้อ] และต้องการเปรียบเทียบเพื่อตอบ [คำถามทบทวนหรือการตัดสินใจ]

งานที่ให้ช่วย:
เปรียบเทียบวัตถุประสงค์ ระเบียบวิธี กลุ่มตัวอย่าง แหล่งข้อมูล วิธีวิเคราะห์ ผลการศึกษา ข้อจำกัด และคุณค่าของแต่ละงาน พร้อมชี้ความเหมือน ความต่าง จุดที่ผลสอดคล้องกัน และผลที่ดูขัดแย้งกัน

ข้อกำหนดการใช้หลักฐาน:
- ใช้เฉพาะบทความที่ให้ และระบุรหัสงานวิจัยในทุกแถวของตาราง
- ถ้าข้อมูลใดไม่มีในบทความ ให้เขียนว่า “ไม่รายงาน” และห้ามคาดเดาเติมเอง
- ก่อนสรุปว่าผลขัดกัน ให้ตรวจว่าประชากร ตัววัด วิธีวิเคราะห์ และบริบทเปรียบเทียบกันได้หรือไม่
- ประเมินน้ำหนักหลักฐานด้วยเกณฑ์ที่ชัดเจนและเหมาะกับแบบแผนวิจัย ห้ามตัดสินจากขนาดกลุ่มตัวอย่างหรือชื่อเสียงวารสารเพียงอย่างเดียว
- ระบุหน้า ตาราง หรือส่วนของบทความที่ใช้ประกอบข้อประเมินสำคัญ หากเอกสารมีข้อมูล

รูปแบบคำตอบ:
ทำตาราง: งานวิจัย | วัตถุประสงค์ | แบบแผนและวิธีวิจัย | กลุ่มตัวอย่างหรือข้อมูล | วิธีวิเคราะห์ | ผลหลัก | ข้อจำกัด | คุณค่าของงาน | น้ำหนักหลักฐานพร้อมเหตุผล จากนั้นอธิบายความเหมือน ความต่างที่มีความหมาย ผลที่ขัดกัน จุดที่สอดคล้องกัน และงานใดให้หลักฐานที่น่าเชื่อถือที่สุดสำหรับ [คำถาม] พร้อมเหตุผล`,
    },
    {
      id: "methodology-evaluation",
      title: "ประเมินระเบียบวิธีวิจัย",
      bestFor: "พิจารณาว่าแบบแผน การเลือกตัวอย่าง การเก็บข้อมูล และการวิเคราะห์ ส่งผลต่อความน่าเชื่อถือและการทำซ้ำของผลวิจัยอย่างไร",
      prompt: `บริบท:
ฉันจะให้ [บทความหนึ่งเรื่องหรือหลายเรื่อง] เกี่ยวกับ [หัวข้อ] งานเหล่านี้ใช้แบบแผนวิจัย [ระบุหากทราบ] และจะนำผลประเมินไปใช้เพื่อ [งานทบทวน/ข้อเสนอโครงการ/การตัดสินใจ]

งานที่ให้ช่วย:
ประเมินแบบแผนวิจัย วิธีเลือกตัวอย่าง การเก็บข้อมูล วิธีวิเคราะห์ ความตรงหรือความน่าเชื่อถือ ความเที่ยงหรือความคงเส้นคงวา การทำซ้ำ และแหล่งอคติที่อาจเกิดขึ้น พร้อมอธิบายว่าทางเลือกแต่ละอย่างมีผลต่อความน่าเชื่อถือของข้อค้นพบอย่างไร

ข้อกำหนดการใช้หลักฐาน:
- ประเมินวิธีวิจัยให้สัมพันธ์กับคำถามและแบบแผนของงานนั้น ห้ามใช้มาตรฐานเดียวตัดสินงานทุกประเภท
- แยกกรณีที่บทความรายงานไม่ครบ ออกจากกรณีที่ยืนยันได้ว่ากระบวนการวิจัยมีปัญหา
- ทุกข้อประเมินต้องมีข้อมูลจากบทความรองรับ พร้อมระบุหน้า ตาราง หรือส่วนที่เกี่ยวข้อง
- หากข้อมูลไม่พอ ให้เขียนว่า “ประเมินไม่ได้จากข้อมูลที่รายงาน”
- อย่าคำนวณคะแนนคุณภาพรวม เว้นแต่เครื่องมือประเมินที่ระบุไว้กำหนดวิธีคิดอย่างชัดเจน

รูปแบบคำตอบ:
รายงานแต่ละงานเป็นตาราง: ทางเลือกด้านระเบียบวิธี | สิ่งที่ผู้วิจัยทำ | จุดแข็ง | ข้อกังวลหรืออคติ | ผลต่อการตีความ | หน้า ตาราง หรือส่วนที่เกี่ยวข้อง | สิ่งที่ควรปรับปรุง แล้วสรุปว่าวิธีวิจัยรองรับข้อสรุปใดได้หรือไม่ได้ พร้อมข้อเสนอสำหรับงานวิจัยครั้งต่อไป`,
    },
    {
      id: "research-gap-analysis",
      title: "วิเคราะห์ช่องว่างจากเอกสารทั้งชุด",
      bestFor: "ค้นหาและจัดลำดับช่องว่างด้านหลักฐาน ประชากร บริบท วิธีวิจัย ทฤษฎี หรือผลที่ยังขัดกัน ภายใต้ขอบเขตการค้นที่กำหนด",
      prompt: `บริบท:
ชุดเอกสารปัจจุบันของฉันครอบคลุม [หัวข้อ/ฐานข้อมูล/ช่วงปี/ภาษา/ประชากร/เกณฑ์คัดเลือก] และต้องการหาประเด็นวิจัยที่เกี่ยวข้องกับ [สาขา/ประชากร/การตัดสินใจ]

งานที่ให้ช่วย:
ทบทวนเอกสารที่ให้เพื่อค้นหาคำถามที่ยังไม่มีคำตอบ ผลที่ยังไม่สอดคล้องกัน ข้อจำกัดด้านวิธีวิจัย ประชากรหรือบริบทที่ยังมีการศึกษาน้อย และหัวข้อใหม่ที่ควรศึกษาเพิ่มเติม

ข้อกำหนดการใช้หลักฐาน:
- ถือว่าช่องว่างทุกข้อเป็นข้อเสนอเบื้องต้นที่จำกัดอยู่ภายในขอบเขตการค้นที่ฉันระบุ
- การมีงานวิจัยน้อยไม่ได้แปลว่าเป็นช่องว่างสำคัญ ต้องอธิบายว่าการขาดความรู้นั้นส่งผลต่อใครหรือการตัดสินใจใด
- เชื่อมช่องว่างแต่ละข้อกับงานวิจัย บันทึกการค้น หรือสิ่งที่ยังขาดจากการเปรียบเทียบในเอกสารชุดนี้
- แยกช่องว่างด้านหลักฐาน ประชากร บริบท วิธีวิจัย ทฤษฎี ผลที่ขัดกัน และการค้นที่ยังไม่ครอบคลุม
- ระบุว่าต้องค้นเพิ่มหรือให้ผู้เชี่ยวชาญตรวจอะไร ก่อนยืนยันว่าช่องว่างนั้นมีอยู่จริง

รูปแบบคำตอบ:
ทำตาราง: ช่องว่างที่เสนอ | ประเภทช่องว่าง | หลักฐานสนับสนุน | หลักฐานโต้แย้ง | เหตุผลที่สำคัญ | สถานะปัจจุบัน [เอกสารชุดนี้สนับสนุน | ต้องค้นเพิ่ม | ยังเสนอเป็นช่องว่างไม่ได้] พร้อมเหตุผล | สิ่งที่ต้องตรวจเพิ่ม | คำถามวิจัยที่ทำได้จริง จากนั้นจัดลำดับความสำคัญและความเป็นไปได้ด้วยเกณฑ์ที่ชัดเจน แล้วเขียนข้อเสนอสำหรับการวิจัยต่อไปอย่างระมัดระวัง`,
    },
    {
      id: "theoretical-framework",
      title: "เชื่อมโยงทฤษฎีและกรอบแนวคิด",
      bestFor: "ทำความเข้าใจว่าทฤษฎี กรอบแนวคิด แบบจำลอง และมโนทัศน์ในเอกสารสัมพันธ์กันอย่างไร และควรพัฒนาต่อยอดตรงไหน",
      prompt: `บริบท:
ฉันจะให้บทความเกี่ยวกับ [หัวข้อ] จาก [สาขาหรือหลายสาขา] และต้องการแผนที่ทางทฤษฎีเพื่อใช้กับ [คำถามทบทวน/กรอบแนวคิด/การออกแบบงานวิจัย]

งานที่ให้ช่วย:
ระบุทฤษฎี กรอบแนวคิด แบบจำลอง และมโนทัศน์สำคัญที่บทความนำมาใช้โดยตรง อธิบายความสัมพันธ์ ส่วนที่ซ้อนทับ ความแตกต่าง และประโยชน์ที่ช่วยให้เข้าใจหัวข้อ พร้อมชี้โอกาสในการพัฒนาทฤษฎีต่อ

ข้อกำหนดการใช้หลักฐาน:
- แยกทฤษฎี กรอบแนวคิด แบบจำลอง และมโนทัศน์ออกจากกัน โดยคงคำเรียกตามที่ผู้เขียนใช้
- อย่าตัดสินว่ากรอบใดมีอิทธิพลเพียงเพราะปรากฏบ่อยในเอกสารชุดเล็กนี้
- ทุกทฤษฎีหรือความสัมพันธ์ต้องระบุงานวิจัยและตำแหน่งที่ให้นิยามหรือนำไปใช้
- ทำเครื่องหมายให้ชัด หากความสัมพันธ์ใดเป็นข้อเสนอจากการตีความของคุณ ไม่ใช่สิ่งที่บทความกล่าวไว้โดยตรง
- ห้ามสร้างนิยาม ผู้เสนอทฤษฎี หรือแหล่งอ้างอิงขึ้นเอง

รูปแบบคำตอบ:
ตอบเป็น 4 ส่วน: 1) ตาราง ทฤษฎีหรือกรอบ | มโนทัศน์หลัก | ความสัมพันธ์ที่เสนอ | งานที่นำไปใช้ | บทบาทในงาน | หน้า ตาราง หรือส่วนที่เกี่ยวข้อง 2) เปรียบเทียบส่วนที่เหมือน ต่าง และขัดแย้ง 3) อธิบายแผนที่แนวคิดที่เชื่อมแต่ละกรอบเข้าด้วยกัน และ 4) โอกาสในการปรับ ขยาย หรือบูรณาการทฤษฎีที่มีหลักฐานรองรับ`,
    },
    {
      id: "critical-appraisal",
      title: "ประเมินความน่าเชื่อถือของงานวิจัย",
      bestFor: "พิจารณาคุณภาพหลักฐานและความสมเหตุสมผลของข้อสรุป ด้วยเกณฑ์ที่เหมาะกับแบบแผนวิจัยแต่ละประเภท",
      prompt: `บริบท:
ฉันจะให้ [บทความ] เกี่ยวกับ [หัวข้อ] พร้อมเกณฑ์ประเมินที่ต้องใช้ หากมี: [ชื่อเครื่องมือหรือแนวทางการรายงาน] ผลประเมินจะนำไปใช้ตอบ [คำถามทบทวนหรือการตัดสินใจ]

งานที่ให้ช่วย:
ประเมินคุณภาพหลักฐาน ความรัดกุมของระเบียบวิธี ความสมเหตุสมผลของข้อสรุป อคติที่อาจเกิดขึ้น สมมติฐานเบื้องหลัง และข้อจำกัดที่ผู้เขียนระบุ พร้อมอธิบายว่าแต่ละงานใช้สนับสนุนข้อสรุปใดได้หรือไม่ได้

ข้อกำหนดการใช้หลักฐาน:
- ใช้เกณฑ์ที่เหมาะกับแบบแผนวิจัยแต่ละประเภท และระบุชื่อกรอบหรือเครื่องมือที่ใช้
- ทุกข้อประเมินต้องมีหลักฐานจากบทความรองรับ พร้อมระบุหน้า ตาราง หรือส่วนที่เกี่ยวข้อง
- แยกความเสี่ยงต่ออคติ ความครบถ้วนของการรายงาน ความตรงกับคำถาม และความมั่นใจในหลักฐานออกจากกัน ไม่รวมเป็นความรู้สึกกว้าง ๆ เพียงข้อเดียว
- อย่าตัดสินว่างานมีคุณภาพสูงเพียงเพราะตีพิมพ์ในวารสารที่มีชื่อเสียง
- หากรายงานข้อมูลไม่พอ ให้เขียนว่า “ข้อมูลไม่เพียงพอสำหรับการประเมิน”

รูปแบบคำตอบ:
รายงานแต่ละงานเป็นตาราง: ด้านที่ประเมิน | ผลการประเมิน | หลักฐานจากบทความ | ผลต่อความน่าเชื่อถือ | คำถามที่ยังค้าง แล้วสรุปภาพรวมเป็น [น่าเชื่อถือค่อนข้างสูง | มีข้อควรระวัง | มีข้อกังวลสำคัญ | ยังประเมินไม่ได้] พร้อมเหตุผล เปรียบเทียบแต่ละงานโดยไม่ใช้คะแนนรวมแบบง่าย ๆ และบอกว่าผลประเมินควรมีผลต่อการสังเคราะห์อย่างไร`,
    },
    {
      id: "citation-network",
      title: "วิเคราะห์เครือข่ายการอ้างอิง",
      bestFor: "ค้นหางานพื้นฐาน ผู้เขียนสำคัญ สายความคิด และงานที่อาจตกหล่น จากรายการอ้างอิงหรือข้อมูลการอ้างอิงที่มีอยู่",
      prompt: `บริบท:
ฉันจะให้ [บทความฉบับเต็มหรือข้อความรอบจุดที่มีการอ้างอิง พร้อมรายการอ้างอิง/ข้อมูลบรรณานุกรม/ไฟล์ส่งออกข้อมูลการอ้างอิง] จากงานเกี่ยวกับ [หัวข้อ] ข้อมูลนี้ครอบคลุม [ฐานข้อมูล/ช่วงปี/วันที่สืบค้น]

งานที่ให้ช่วย:
วิเคราะห์เครือข่ายการอ้างอิงเพื่อหางานพื้นฐาน งานสำคัญ ผู้เขียนที่มีบทบาท ทฤษฎีที่ถูกนำมาใช้บ่อย กลุ่มงานที่เชื่อมโยงกัน และงานที่ทำหน้าที่เชื่อมระหว่างกลุ่ม หากมีบทความฉบับเต็มหรือข้อความรอบจุดอ้างอิง ให้อธิบายว่างานที่ถูกอ้างถึงมีอิทธิพลต่อคำถาม แนวคิด วิธีวิจัย หรือการตีความของบทความปัจจุบันอย่างไร พร้อมชี้งานสำคัญหรืองานใหม่ที่อาจยังไม่อยู่ในการอภิปราย

ข้อกำหนดการใช้หลักฐาน:
- สรุปความสัมพันธ์จากข้อมูลการอ้างอิงที่ฉันให้เท่านั้น และบอกข้อจำกัดของขอบเขตข้อมูล
- หากมีเพียงข้อมูลบรรณานุกรมหรือข้อมูลเครือข่าย ห้ามคาดเดาอิทธิพลทางความคิด ให้เขียนว่า “ยังระบุไม่ได้หากไม่มีข้อความรอบจุดอ้างอิง” พร้อมบอกว่าต้องใช้บทความหรือข้อความส่วนใดเพิ่ม
- แยก “งานที่บทความอ้างถึง” ออกจาก “งานรุ่นหลังที่มาอ้างบทความนี้”
- จำนวนการอ้างอิงไม่ได้ยืนยันคุณภาพ ความถูกต้องในปัจจุบัน หรือการสนับสนุนเชิงบวก
- ตรวจและทำเครื่องหมายการอ้างตนเอง รายการซ้ำ และชื่อผู้เขียนที่อาจเป็นคนละคน หากข้อมูลเอื้อให้ตรวจได้
- งานที่อาจตกหล่นเป็นเพียงคำแนะนำสำหรับค้นต่อ จนกว่าจะตรวจยืนยันจากฐานข้อมูลภายนอก

รูปแบบคำตอบ:
ตอบเป็น 5 ส่วน: 1) ตาราง แหล่งข้อมูล | บทบาทในเครือข่ายการอ้างอิง | ความเชื่อมโยงหรือกลุ่ม | อิทธิพลต่อบทความปัจจุบันหรือ “ยังระบุไม่ได้” | หลักฐานจากข้อความรอบจุดอ้างอิง | ข้อควรระวัง 2) อธิบายกลุ่มงานหลักและความเชื่อมโยง 3) งานพื้นฐานและงานเชื่อมที่ควรอ่านก่อน 4) รายชื่องานที่อาจตกหล่นพร้อมคำค้นสำหรับตรวจสอบ และ 5) ข้อจำกัดจากขอบเขตข้อมูลและวันที่สืบค้น [วันที่]`,
    },
  ],
});
