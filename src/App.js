import React, { useState, useRef, useEffect, useCallback } from "react";
import jsPDF from "jspdf";

/* ═══════════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════════ */

const BIG5 = {
  openness: {
    label: "Openness", subtitle: "Curiosity, creativity & openness to experience", color: "#E07A5F",
    questions: [
      { text: "I enjoy trying new and unfamiliar experiences.", desc: "New foods, places, activities, ways of doing things.", dir: 1 },
      { text: "I have a vivid imagination.", dir: 1 },
      { text: "I prefer routine over variety.", desc: "You'd rather have a predictable day than a surprising one.", dir: -1 },
      { text: "I enjoy thinking about abstract ideas and theories.", desc: "Philosophy, 'what if' questions, big-picture thinking.", dir: 1 },
      { text: "I appreciate art, music, or literature on a deep emotional level.", dir: 1 },
      { text: "I tend to stick with what I know rather than exploring new options.", dir: -1 },
      { text: "I often daydream or get lost in my thoughts.", dir: 1 },
      { text: "I'm interested in learning about different cultures and worldviews.", dir: 1 },
      { text: "I find beauty or meaning in things that others might overlook.", desc: "A sunset, a well-designed object, an interesting pattern.", dir: 1 },
      { text: "I'd rather do something the proven way than experiment with a new approach.", dir: -1 },
      { text: "I enjoy conversations about ideas more than conversations about daily events.", dir: 1 },
      { text: "I feel uncomfortable when things are ambiguous or open to interpretation.", desc: "You prefer clear answers and straightforward situations.", dir: -1 },
    ],
  },
  conscientiousness: {
    label: "Conscientiousness", subtitle: "Organization, discipline & follow-through", color: "#3D405B",
    questions: [
      { text: "I keep my spaces organized and tidy.", dir: 1 },
      { text: "I follow through on plans and commitments.", dir: 1 },
      { text: "I often procrastinate on important tasks.", dir: -1 },
      { text: "I set goals and work systematically toward them.", desc: "Not just having goals, but having a plan and sticking to it.", dir: 1 },
      { text: "I pay close attention to details.", dir: 1 },
      { text: "I tend to act on impulse rather than planning ahead.", dir: -1 },
      { text: "I finish what I start, even when it gets difficult or boring.", dir: 1 },
      { text: "I make to-do lists or use systems to stay on track.", dir: 1 },
      { text: "I'm often late to appointments or deadlines.", dir: -1 },
      { text: "I think carefully about consequences before making decisions.", dir: 1 },
      { text: "I find it easy to resist temptations and distractions.", desc: "Phone notifications, social media, snacking, etc.", dir: 1 },
      { text: "My work or school performance is inconsistent — great sometimes, poor other times.", dir: -1 },
    ],
  },
  extraversion: {
    label: "Extraversion", subtitle: "Social energy, assertiveness & enthusiasm", color: "#D4A04A",
    questions: [
      { text: "I feel energized after spending time with a group of people.", dir: 1 },
      { text: "I enjoy being the center of attention.", dir: 1 },
      { text: "I prefer spending time alone over socializing.", dir: -1 },
      { text: "I find it easy to start conversations with strangers.", dir: 1 },
      { text: "I tend to be talkative in social situations.", dir: 1 },
      { text: "I often feel drained after social interactions.", dir: -1 },
      { text: "I get excited and enthusiastic easily.", desc: "About plans, ideas, events — you show it outwardly.", dir: 1 },
      { text: "I seek out leadership roles in groups or teams.", dir: 1 },
      { text: "At parties or gatherings, I tend to hang back and observe.", dir: -1 },
      { text: "I express my opinions openly, even in groups.", dir: 1 },
      { text: "I prefer deep one-on-one conversations to group socializing.", dir: -1 },
      { text: "I like having a busy social calendar.", dir: 1 },
    ],
  },
  agreeableness: {
    label: "Agreeableness", subtitle: "Compassion, cooperation & trust in others", color: "#81B29A",
    questions: [
      { text: "I go out of my way to help others, even when it's inconvenient.", dir: 1 },
      { text: "I tend to trust people's good intentions.", dir: 1 },
      { text: "I find it hard to forgive people who have wronged me.", dir: -1 },
      { text: "I try to see things from other people's perspectives.", dir: 1 },
      { text: "I avoid conflict whenever possible.", dir: 1 },
      { text: "I tend to be skeptical of others' motives.", dir: -1 },
      { text: "I feel genuinely happy when good things happen to other people.", dir: 1 },
      { text: "I'm willing to compromise to keep the peace.", desc: "Even if it means not getting exactly what you want.", dir: 1 },
      { text: "I can be blunt or direct in a way that sometimes upsets people.", dir: -1 },
      { text: "I prioritize being kind over being right.", dir: 1 },
      { text: "I find it difficult to say no when someone asks for help.", dir: 1 },
      { text: "When I disagree with someone, I tend to push my point rather than back down.", dir: -1 },
    ],
  },
  neuroticism: {
    label: "Neuroticism", subtitle: "Emotional sensitivity, stress response & volatility", color: "#A8577E",
    questions: [
      { text: "I often feel anxious or worried about things.", dir: 1 },
      { text: "My mood changes frequently throughout the day.", dir: 1 },
      { text: "I stay calm and composed under pressure.", dir: -1 },
      { text: "I tend to overthink things that have already happened.", desc: "Replaying conversations, second-guessing decisions.", dir: 1 },
      { text: "Small setbacks can ruin my whole day.", dir: 1 },
      { text: "I recover quickly from stressful situations.", dir: -1 },
      { text: "I often feel insecure about myself or my abilities.", dir: 1 },
      { text: "I get frustrated or irritated easily.", dir: 1 },
      { text: "I can handle criticism without taking it personally.", dir: -1 },
      { text: "I frequently compare myself to others.", dir: 1 },
      { text: "I tend to expect the worst in uncertain situations.", desc: "When you don't know the outcome, you assume it'll be bad.", dir: 1 },
      { text: "When something goes wrong, I can usually put it in perspective and move on.", dir: -1 },
    ],
  },
};

const WELL = {
  mental: {
    label: "Mental Wellness", subtitle: "Stress management, emotional health & self-care", icon: "\u{1F9E0}", color: "#6A8EAE",
    questions: [
      { text: "I have healthy ways to cope when I'm stressed.", desc: "Exercise, talking to someone, journaling — not just numbing out.", dir: 1 },
      { text: "I get enough quality sleep most nights (7-9 hours).", dir: 1 },
      { text: "I often feel overwhelmed by my responsibilities.", dir: -1 },
      { text: "I regularly do something that brings me joy or relaxation.", desc: "A hobby, time outdoors, creative activity — something just for you.", dir: 1 },
      { text: "I'm able to recognize and name my emotions as I feel them.", desc: "Not just 'I feel bad' but 'I feel frustrated because...'", dir: 1 },
      { text: "I tend to be very self-critical when I make mistakes.", dir: -1 },
      { text: "I feel generally optimistic about my future.", dir: 1 },
      { text: "I know when to ask for help and feel comfortable doing so.", dir: 1 },
      { text: "I use substances (alcohol, drugs, nicotine) to manage stress or emotions.", desc: "Even casually — think about whether it's become a go-to coping method.", dir: -1 },
      { text: "I engage in regular physical activity that supports my mental health.", desc: "Walking, gym, sports, yoga — anything that gets you moving.", dir: 1 },
      { text: "I talk to myself in a way that is mostly encouraging rather than harsh.", desc: "Your inner voice — is it a coach or a critic?", dir: 1 },
      { text: "I spend more time on screens than I'd like, and it affects my mood or sleep.", dir: -1 },
    ],
  },
  social: {
    label: "Social Wellness", subtitle: "Relationships, communication & community", icon: "\u{1F91D}", color: "#81B29A",
    questions: [
      { text: "I have people in my life I can truly count on.", dir: 1 },
      { text: "I feel comfortable setting boundaries with others.", desc: "Saying no, protecting your time, expressing limits.", dir: 1 },
      { text: "I often feel lonely or disconnected from others.", dir: -1 },
      { text: "I actively maintain my important relationships.", desc: "Reaching out, making plans, checking in on people.", dir: 1 },
      { text: "I can express my needs clearly in relationships.", dir: 1 },
      { text: "I tend to avoid difficult conversations.", desc: "Even when something important needs to be said.", dir: -1 },
      { text: "I feel like I belong to a community or group.", desc: "A team, friend group, club, faith community, or any group where you feel at home.", dir: 1 },
      { text: "I make time for social activities regularly.", dir: 1 },
      { text: "I often feel like I'm performing a version of myself rather than being authentic.", desc: "Putting on a mask or acting differently than how you really feel.", dir: -1 },
      { text: "I have at least one person I can be completely honest with.", desc: "Someone you don't have to filter yourself around.", dir: 1 },
      { text: "I'm comfortable being vulnerable with people I trust.", desc: "Sharing fears, mistakes, or emotions — not just the highlight reel.", dir: 1 },
      { text: "My relationships feel one-sided — I give more than I receive.", dir: -1 },
    ],
  },
  intellectual: {
    label: "Intellectual Wellness", subtitle: "Learning, curiosity & mental engagement", icon: "\u{1F4DA}", color: "#E07A5F",
    questions: [
      { text: "I actively seek out opportunities to learn new things.", dir: 1 },
      { text: "I enjoy engaging with ideas that challenge my thinking.", dir: 1 },
      { text: "I rarely read, listen to podcasts, or engage with new content.", dir: -1 },
      { text: "I can think critically about information before accepting it.", desc: "Questioning sources, checking assumptions, not believing everything you see.", dir: 1 },
      { text: "I enjoy solving problems and figuring things out.", dir: 1 },
      { text: "I feel mentally stagnant or bored most of the time.", dir: -1 },
      { text: "I pursue hobbies or interests that stimulate my mind.", dir: 1 },
      { text: "I'm open to changing my mind when presented with good evidence.", dir: 1 },
      { text: "I tend to passively consume content rather than actively engaging with it.", desc: "Scrolling without thinking vs. reading, discussing, or creating.", dir: -1 },
      { text: "I can explain my own views and the reasoning behind them.", desc: "Not just having opinions, but understanding why you hold them.", dir: 1 },
      { text: "I've learned a meaningful new skill or topic in the past few months.", desc: "Something beyond what was required for school or work.", dir: 1 },
      { text: "I tend to avoid topics or conversations that are intellectually challenging.", dir: -1 },
    ],
  },
  financial: {
    label: "Financial Wellness", subtitle: "Money management, planning & financial literacy", icon: "\u{1F4B0}", color: "#D4A04A",
    questions: [
      { text: "I have a budget or spending plan that I follow.", dir: 1 },
      { text: "I regularly set aside money for savings.", desc: "Any amount, even small — the habit matters more than the number.", dir: 1 },
      { text: "I often worry about money or feel financially stressed.", dir: -1 },
      { text: "I understand the basics of credit, debt, and interest rates.", desc: "How credit scores work, what APR means, how debt compounds over time.", dir: 1 },
      { text: "I feel in control of my financial situation.", dir: 1 },
      { text: "I tend to make impulsive purchases I later regret.", dir: -1 },
      { text: "I have financial goals I'm working toward.", desc: "Saving for something specific, paying off debt, building an emergency fund.", dir: 1 },
      { text: "I could handle an unexpected expense of $500 without major stress.", dir: 1 },
      { text: "I avoid looking at my bank account because I don't want to know.", dir: -1 },
      { text: "I understand the difference between needs and wants when I spend.", desc: "And you generally make intentional choices about which is which.", dir: 1 },
      { text: "I have some understanding of investing, retirement accounts, or building wealth.", desc: "Even basic awareness — 401k, index funds, compound growth.", dir: 1 },
      { text: "I feel behind financially compared to where I think I should be.", dir: -1 },
    ],
  },
  occupational: {
    label: "Occupational Wellness", subtitle: "Purpose, career direction & work-life balance", icon: "\u{1F3AF}", color: "#3D405B",
    questions: [
      { text: "I have a clear sense of direction for my career or future.", dir: 1 },
      { text: "I feel that my work or studies are meaningful.", dir: 1 },
      { text: "I feel stuck or uncertain about what I want to do with my life.", dir: -1 },
      { text: "I'm actively developing skills that will help my future career.", dir: 1 },
      { text: "I maintain a healthy balance between work/school and personal life.", dir: 1 },
      { text: "I often feel burned out or exhausted by my responsibilities.", dir: -1 },
      { text: "I can identify my strengths and how to use them professionally.", dir: 1 },
      { text: "I feel motivated and engaged in my daily work or studies.", dir: 1 },
      { text: "I'm pursuing a path because others expect it, not because I chose it.", desc: "A major, job, or career track that's more about pleasing others than following your own interests.", dir: -1 },
      { text: "I've talked to people working in fields that interest me.", desc: "Informational interviews, mentors, shadowing — any real-world exposure.", dir: 1 },
      { text: "I have a professional network or mentors I can turn to for guidance.", desc: "People in your field or desired field who know your name.", dir: 1 },
      { text: "I often feel like I'm just going through the motions without real purpose.", dir: -1 },
    ],
  },
};

const SCALE = ["Strongly Disagree","Disagree","Slightly Disagree","Neutral","Slightly Agree","Agree","Strongly Agree"];

/* ═══════════════════════════════════════════════════════════════════════════
   PERSONALITY INSIGHTS
   ═══════════════════════════════════════════════════════════════════════════ */

const P_INS = {
  openness: {
    high: { title:"The Explorer", desc:"You're drawn to novelty, ideas, and creative expression. You think in possibilities and get energized by the unfamiliar. You probably have wide-ranging interests and get restless with too much routine.", realLife:"In school, you do best in classes that let you think creatively. In relationships, you crave depth and novelty. At work, you'll thrive in roles that let you innovate and explore — and wilt in rigid, process-heavy environments.", strengths:["Creative problem-solving","Adaptability to change","Intellectual curiosity","Seeing unconventional connections"], watchOuts:["May struggle with routine tasks","Can overthink or get lost in abstractions","May start many projects but finish few","Risk of being perceived as impractical"], exercises:["This week: Pick ONE of your many interests and go deeper instead of broader. Spend 3 focused hours on it.","Try 'structured creativity' — set a timer for 25 minutes and work on a creative project with no distractions.","Ask someone more practical how they'd approach a problem you're working on. Try their method once."], reflection:"Think about a time your openness led to something great. Now think about a time it caused you to lose focus. What's the pattern?" },
    low: { title:"The Pragmatist", desc:"You value what's proven and practical. You're grounded, consistent, and prefer clarity over ambiguity. You're reliable, efficient, and good at executing.", realLife:"In school, you do well with clear expectations and structured assignments. In relationships, you show love through actions and consistency. At work, you'll excel with clear processes, measurable outcomes, and concrete deliverables.", strengths:["Reliable and consistent","Strong focus on practical outcomes","Comfortable with established methods","Efficient decision-making"], watchOuts:["May resist beneficial changes","Could miss creative solutions","May dismiss abstract ideas","Risk of getting stuck in comfortable ruts"], exercises:["This week: Try one thing you'd normally never do — a new genre of music, a different route, a food you've never had.","When you think 'that's not practical,' pause and ask 'but what if it worked?'","Have a conversation with someone who thinks very differently. Just try to understand."], reflection:"Think about a time the proven approach served you well. Now think about a time it kept you from something better. How do you tell the difference?" },
  },
  conscientiousness: {
    high: { title:"The Achiever", desc:"You're disciplined, organized, and driven. You take commitments seriously and follow through. Others see you as someone who has their life together — and you hold yourself to high standards.", realLife:"In school, you're reliable about deadlines — maybe the person others come to for notes. In relationships, you're dependable. At work, you'll be trusted with responsibility early. But you may burn out if you don't manage your own expectations.", strengths:["Strong self-discipline","Excellent planning","Reliable follow-through","Goal-oriented mindset"], watchOuts:["May become rigid or perfectionistic","Can overwork and neglect rest","May judge less organized people","Might miss opportunities requiring spontaneity"], exercises:["This week: Leave one low-stakes task 'good enough' instead of perfect. Notice how it feels.","Schedule unstructured free time — and protect it. No tasks, no goals.","Ask someone: 'Do I ever make you feel judged for not being organized?'"], reflection:"Where does your discipline tip into rigidity or self-punishment? Think about the last time you pushed through when you should have rested." },
    low: { title:"The Improviser", desc:"You're flexible, spontaneous, and comfortable going with the flow. Structure feels confining. You're adaptable and easygoing — but long-term planning may not come naturally.", realLife:"In school, you do well when interested but struggle with consistent effort. In relationships, you're fun but may forget commitments. At work, you'll need external systems or roles that reward adaptability.", strengths:["Adaptable and flexible","Comfortable with ambiguity","Can pivot quickly","Low stress about imperfection"], watchOuts:["May miss deadlines or forget commitments","Can struggle with sustained effort","Financial planning may be a weak spot","Others may see you as unreliable"], exercises:["This week: Use one to-do list. Write every commitment. Check it every morning.","Pick one recurring task and do it at the exact same time weekly for 3 weeks.","Set up one automatic system: auto-pay, auto-save, or auto-schedule."], reflection:"What has your flexibility cost you? A missed opportunity, a damaged relationship, a financial setback? Is the tradeoff worth it?" },
  },
  extraversion: {
    high: { title:"The Connector", desc:"You thrive on social interaction and draw energy from others. You're expressive, enthusiastic, and probably the person who gets things going in a group.", realLife:"In school, you do well with group projects and discussions — and may struggle with solitary focus work. In relationships, you're warm but may fill silence with activity instead of depth. At work, you'll gravitate toward people-facing roles.", strengths:["Natural networking ability","Energizes groups","Comfortable with leadership","Quick to take action"], watchOuts:["May struggle with solitary concentration","Can dominate conversations","May avoid alone-time for reflection","Risk of confusing busy with productive"], exercises:["Spend one full evening alone — no social media, texting, or calls. Notice what comes up.","Practice the '3-second rule' — wait 3 seconds after someone finishes before responding.","Ask a close friend: 'Is there anything you've wanted to tell me that you couldn't because I was talking?'"], reflection:"When was the last time you had a conversation that was truly deep, not just fun? What made it different?" },
    low: { title:"The Observer", desc:"You recharge through solitude and prefer depth over breadth. You think before you speak and have a rich inner world most people never see.", realLife:"In school, you do well on written work but may dread presentations. In relationships, you have deep loyalty to a small circle. At work, you'll do best independently — but need to push yourself to be visible.", strengths:["Deep thinking","Strong one-on-one relationships","Independent worker","Careful decision-making"], watchOuts:["May avoid beneficial social situations","Can seem disengaged when processing","May not advocate for yourself","Risk of isolation disguised as preference"], exercises:["Start one conversation with someone you don't know well this week.","Before your next group discussion, prepare one thing to say.","Send a message to someone you value but haven't connected with lately."], reflection:"Where's the line between healthy solitude and avoidance? Are you skipping situations because you don't need them — or because they're uncomfortable?" },
  },
  agreeableness: {
    high: { title:"The Harmonizer", desc:"You're compassionate, cooperative, and attuned to others' needs. You value relationships and hate conflict. People trust you — but you may make groups function smoothly at your own expense.", realLife:"In school, you're a great group member — maybe too great, doing more than your share. In relationships, you're supportive but may struggle to voice your own needs. At work, you'll be liked but may get overlooked because you don't self-advocate.", strengths:["Strong empathy","Excellent team player","Trusted by others","Creates positive environments"], watchOuts:["May sacrifice your own needs","Struggles to say no","Avoids necessary conflict","Risk of being taken advantage of"], exercises:["Say no to one request you'd normally agree to. Notice what happens.","Practice: 'I'd like to help, but I can't right now.' Use it once this week.","Share one opinion you hold but rarely express because others might disagree."], reflection:"Think about a time you said yes when you meant no. What were you afraid of? Was that fear realistic?" },
    low: { title:"The Challenger", desc:"You're direct, competitive, and willing to push back. You prioritize truth and results over harmony. People know where they stand with you.", realLife:"In school, you're comfortable debating — but may clash with others. In relationships, you're honest but may hurt with bluntness. At work, you'll negotiate well but team dynamics may suffer.", strengths:["Honest communication","Comfortable with tough decisions","Strong negotiation","Not easily manipulated"], watchOuts:["May come across as harsh","Can damage relationships with bluntness","May struggle with teamwork","Risk of being right but alone"], exercises:["Before critical feedback, lead with one genuine positive thing.","In your next disagreement, repeat the other person's position back before stating yours.","Ask someone you disagreed with: 'Did I handle that okay?'"], reflection:"What's the difference between honest and harsh? Have you used 'I'm just being real' as a shield for not considering feelings?" },
  },
  neuroticism: {
    high: { title:"The Sensitive", desc:"You experience emotions intensely and are attuned to potential threats. You feel things deeply — both good and bad. Your mind scans for what could go wrong, making you vigilant but exhausted.", realLife:"In school, test anxiety or imposter syndrome may hold you back. In relationships, you may need more reassurance and read threats into neutral situations. At work, stress management will determine your success more than any other skill.", strengths:["Emotional depth","Strong empathy","Motivated to prevent problems","Rich inner life"], watchOuts:["Prone to anxiety spirals","Can catastrophize","May avoid challenges","Physical health suffers from chronic stress"], exercises:["Try the '5-5-5 rule': Will this matter in 5 days? 5 months? 5 years?","When ruminating, physically change your environment. Break the loop with movement.","Write your 3 biggest worries. Next to each: one thing you can control, one you can't.","Try 10 minutes of guided meditation — give your overactive brain structured downtime."], reflection:"How much mental energy goes toward things that haven't happened yet? What would you do with that energy if you could redirect even half?" },
    low: { title:"The Steady", desc:"You're emotionally stable, calm under pressure, and hard to rattle. You bounce back quickly and don't spend much time worrying. People see you as unflappable.", realLife:"In school, you handle pressure well with little test anxiety. In relationships, your steadiness is calming — but you may not understand why others get upset. At work, you'll be trusted in crises.", strengths:["Resilient under stress","Calm decision-making","Emotionally consistent","Natural composure"], watchOuts:["May not recognize when you need support","Can seem emotionally distant","May underestimate your own stress","Risk of ignoring signals until physical symptoms appear"], exercises:["Check in: actually ask 'how am I feeling?' Not 'I'm fine' — really sit with it.","When someone shares a problem, try 'that sounds really hard' before offering solutions.","Notice if you've dismissed someone's reaction as 'overreacting.'"], reflection:"Is there something you've been pushing through that you should be processing? Toughness is great until it becomes numbness." },
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   CROSS-TRAIT INSIGHTS
   ═══════════════════════════════════════════════════════════════════════════ */

function getCross(s, n) {
  const r = [];
  if (s.openness>=55&&s.conscientiousness>=55) r.push({t:"Openness + Conscientiousness",i:"\u2B50",x:`You're rare, ${n}. Creativity AND discipline. Your challenge is choosing what to focus on.`,p:0});
  else if (s.openness>=55&&s.conscientiousness<45) r.push({t:"Openness + Conscientiousness",i:"\u26A1",x:`Tons of ideas, inconsistent follow-through. You don't need more inspiration — you need systems. Conscientiousness exercises are priority #1.`,p:0});
  else if (s.openness<45&&s.conscientiousness>=55) r.push({t:"Openness + Conscientiousness",i:"\u{1F527}",x:`You're an execution machine. Pair up with creative people who push your thinking while you keep things on track.`,p:1});
  if (s.extraversion>=55&&s.agreeableness>=55) r.push({t:"Extraversion + Agreeableness",i:"\u{1F31F}",x:`People love being around you. But your desire to be liked can lead to overcommitting. Your growth edge: learning to disappoint people sometimes.`,p:1});
  else if (s.extraversion>=55&&s.agreeableness<45) r.push({t:"Extraversion + Agreeableness",i:"\u{1F525}",x:`Bold and assertive — leadership energy that can become steamroller energy. Check if people feel heard along the way.`,p:1});
  else if (s.extraversion<45&&s.agreeableness>=55) r.push({t:"Extraversion + Agreeableness",i:"\u{1F92B}",x:`Kind and selfless, but quiet about it. People may not notice your contributions. Make your voice heard, not just your helpfulness.`,p:1});
  if (s.neuroticism>=55&&s.conscientiousness>=55) r.push({t:"Neuroticism + Conscientiousness",i:"\u{1F504}",x:`The perfectionist's combination. Excellent work, but at what cost? Learning 'good enough' will transform your quality of life.`,p:0});
  else if (s.neuroticism>=55&&s.conscientiousness<45) r.push({t:"Neuroticism + Conscientiousness",i:"\u{1F630}",x:`You worry but struggle to take organized action. Start with the smallest steps — anxiety shrinks when you take even tiny action.`,p:0});
  if (s.neuroticism>=55&&s.extraversion<45) r.push({t:"Neuroticism + Extraversion",i:"\u{1F3D4}\uFE0F",x:`You process internally — so worries have no outlet. Find 1-2 trusted people and practice opening up.`,p:1});
  if (s.openness>=55&&s.extraversion>=55) r.push({t:"Openness + Extraversion",i:"\u{1F680}",x:`Curious AND social — a natural connector of people and ideas. Look for roles combining creativity with people interaction.`,p:2});
  return r.sort((a,b)=>a.p-b.p);
}

function getPWCross(p, w, n) {
  const r = [];
  if (p.neuroticism>=55&&w.mental<50) r.push({i:"\u26A1",t:"Emotional Sensitivity + Mental Wellness",x:`${n}, this is your most important insight. Your personality amplifies stress, and your current habits aren't compensating. Stress management needs to be daily — exercise, sleep, and someone to talk to are necessities.`});
  if (p.conscientiousness<45&&w.financial<50) r.push({i:"\u{1F4A1}",t:"Spontaneous Nature + Financial Wellness",x:`Traditional budgeting feels like a straitjacket. The fix isn't willpower — it's automation. Auto-save, auto-pay, spending alerts. Work WITH your personality.`});
  if (p.extraversion<45&&w.social<50) r.push({i:"\u{1F511}",t:"Introversion + Social Wellness",x:`You don't need more parties — you need deeper connections. Focus on 2-3 close relationships. Depth, not breadth.`});
  if (p.openness>=55&&w.intellectual>=60) r.push({i:"\u{1F680}",t:"Curiosity + Intellectual Wellness",x:`Natural strength. Now channel it: apply this energy to your weaker wellness areas. Your curiosity is a tool — use it strategically.`});
  if (p.agreeableness>=55&&w.occupational<50) r.push({i:"\u{1F3AF}",t:"People-Pleasing + Career Uncertainty",x:`Agreeable people often build careers around what others need. Are you on YOUR path or someone else's? Career clarity improves when you give yourself permission to want things.`});
  if (p.conscientiousness>=55&&w.mental<50) r.push({i:"\u{1F504}",t:"Discipline + Low Mental Wellness",x:`You push through everything — including burnout. Apply your discipline to rest: schedule downtime, enforce a bedtime, put self-care on your to-do list.`});
  if (p.extraversion>=55&&w.occupational>=60) r.push({i:"\u{1F310}",t:"Social Energy + Career Direction",x:`Your social energy and career clarity work together. Lean into networking and informational interviews — not everyone can do this as easily as you.`});
  if (p.neuroticism<45&&w.social>=60) r.push({i:"\u2693",t:"Emotional Stability + Social Strength",x:`Your calm presence makes others gravitate to you in stressful times. Use this in leadership and mentoring.`});
  if (p.openness<45&&w.intellectual<50) r.push({i:"\u{1F50D}",t:"Practical Nature + Intellectual Engagement",x:`You may not seek learning for its own sake. Find practical reasons to grow — a new skill that directly helps your career kills two birds with one stone.`});
  if (p.agreeableness<45&&w.social<50) r.push({i:"\u{1F6E1}\uFE0F",t:"Directness + Social Challenges",x:`Your direct style may be contributing to lower social wellness. You don't need to become a people-pleaser — but warmth alongside honesty strengthens relationships.`});
  return r;
}

/* ═══════════════════════════════════════════════════════════════════════════
   TOP 3 PRIORITIES
   ═══════════════════════════════════════════════════════════════════════════ */

function getTop3(pS, wS, name) {
  const areas = [
    { key: "mental", label: "Mental Wellness", icon: "\u{1F9E0}", score: wS.mental, color: "#6A8EAE" },
    { key: "social", label: "Social Wellness", icon: "\u{1F91D}", score: wS.social, color: "#81B29A" },
    { key: "intellectual", label: "Intellectual Wellness", icon: "\u{1F4DA}", score: wS.intellectual, color: "#E07A5F" },
    { key: "financial", label: "Financial Wellness", icon: "\u{1F4B0}", score: wS.financial, color: "#D4A04A" },
    { key: "occupational", label: "Occupational Wellness", icon: "\u{1F3AF}", score: wS.occupational, color: "#3D405B" },
  ];
  areas.forEach(a => {
    let u = 100 - a.score;
    if (a.key==="mental"&&pS.neuroticism>=55) u+=15;
    if (a.key==="mental"&&pS.conscientiousness>=60) u+=5;
    if (a.key==="financial"&&pS.conscientiousness<45) u+=10;
    if (a.key==="social"&&pS.extraversion<45) u+=5;
    if (a.key==="social"&&pS.agreeableness<45) u+=5;
    if (a.key==="occupational"&&pS.agreeableness>=55) u+=5;
    if (a.key==="intellectual"&&pS.openness<45) u+=5;
    a.urgency = u;
  });
  areas.sort((a,b) => b.urgency - a.urgency);
  const top = areas.slice(0, 3);
  const priorities = [];
  top.forEach((a, rank) => {
    let why = "", doThis = "";
    if (a.key==="mental") {
      if (pS.neuroticism>=55) { why=`Your emotional sensitivity means stress hits you harder than most. Without strong mental wellness habits, everything else suffers \u2014 relationships, school, career, finances. This is your foundation.`; doThis=`This week: establish one non-negotiable daily stress practice. A 10-minute walk, journaling before bed, or a guided meditation. Pick one and do it every single day.`; }
      else if (pS.conscientiousness>=55) { why=`You're disciplined enough to push through burnout without realizing it. Your mental wellness score suggests you're running on fumes. Rest isn't laziness \u2014 for you, it's strategic.`; doThis=`This week: block 30 minutes of genuine downtime on your calendar every day. Treat it like a meeting you can't cancel.`; }
      else { why=`Mental wellness is the foundation everything else is built on. When stress, sleep, or emotional health are off, every other area feels harder than it needs to.`; doThis=`This week: pick the ONE thing most affecting your mental health (sleep, stress, self-talk, screen time) and make one small change.`; }
    } else if (a.key==="financial") {
      if (pS.conscientiousness<45) { why=`Your spontaneous personality means financial discipline won't come naturally \u2014 which is exactly why you need systems doing the work for you. Automate now, thank yourself later.`; doThis=`This week: set up one automatic system \u2014 auto-transfer even $10 to savings, or auto-pay one bill. Remove the need for willpower.`; }
      else { why=`Financial stress is one of the biggest drivers of anxiety and relationship strain. Getting even basic control over your money will reduce stress across your entire life.`; doThis=`This week: download a free budgeting app and track every dollar you spend for 7 days. Awareness is the first step.`; }
    } else if (a.key==="social") {
      if (pS.extraversion<45) { why=`As someone who recharges alone, it's easy to let social connections fade without noticing. But even introverts need deep, meaningful relationships to thrive.`; doThis=`This week: reach out to one person you care about but haven't talked to recently. A simple 'thinking of you' text is enough.`; }
      else if (pS.agreeableness<45) { why=`Your direct communication style is a strength, but it may be creating distance in relationships you value. Small adjustments in warmth make a big difference.`; doThis=`This week: in one conversation, practice leading with curiosity instead of your opinion. Ask a question and really listen.`; }
      else { why=`Humans are wired for connection. Loneliness, inauthenticity, or one-sided relationships drain energy from everything else you're trying to build.`; doThis=`This week: have one honest conversation where you share something real \u2014 not just surface-level updates.`; }
    } else if (a.key==="occupational") {
      if (pS.agreeableness>=55) { why=`Your agreeable nature may have led you down a path that serves others more than yourself. Career clarity often starts with asking: what do I actually want?`; doThis=`This week: write down 3 things you'd do if nobody's expectations mattered. Then ask how far your current path is from those things.`; }
      else { why=`Without direction or purpose, motivation becomes a daily battle. You don't need a perfect plan \u2014 you need enough clarity to take the next step.`; doThis=`This week: have one conversation with someone in a field that interests you. Ask what they love and what they'd change.`; }
    } else if (a.key==="intellectual") {
      if (pS.openness<45) { why=`Your practical nature means you might not seek learning for its own sake \u2014 but intellectual growth directly impacts your career and problem-solving.`; doThis=`This week: find one practical skill to learn that directly helps a goal you already have.`; }
      else { why=`Your mind needs regular challenges to stay sharp. When intellectual wellness drops, boredom and stagnation follow \u2014 affecting motivation everywhere.`; doThis=`This week: replace 30 minutes of passive scrolling with something that makes you think \u2014 a podcast, an article, a real conversation.`; }
    }
    priorities.push({ rank: rank+1, label: a.label, icon: a.icon, score: a.score, color: a.color, why, doThis });
  });
  return priorities;
}

/* ═══════════════════════════════════════════════════════════════════════════
   WELLNESS INSIGHTS
   ═══════════════════════════════════════════════════════════════════════════ */

const W_INS = {
  mental: {
    high:{s:"You've built solid mental health habits. You manage stress well, have emotional self-awareness, and maintain supportive practices.",t:["Keep doing what works — consistency is everything","Consider being a resource for others who struggle here","Push yourself to grow in new areas — your foundation can handle it"]},
    mid:{s:"You have some good practices but clear gaps. You might handle some stressors well while others derail you.",t:["Identify your top 2 stressors and develop a specific coping plan","Build one new self-care habit this month — small and sustainable","Talk to someone you trust about what's weighing on you","Audit your screen time — is it helping or hurting?"]},
    low:{s:"Mental wellness needs attention. Whether it's stress, sleep, self-criticism, substances, or feeling overwhelmed — something here is significantly impacting your life.",t:["Start with sleep — it affects everything else. Set a consistent bedtime.","If you're using substances to cope, be honest about that pattern","Find one healthy coping mechanism and use it daily","Talk to a counselor — it's self-awareness, not weakness","Would you talk to a friend the way you talk to yourself?"]},
  },
  social: {
    high:{s:"Strong social connections, authentic relationships, and solid communication. This is a real foundation for overall wellbeing.",t:["Deepen existing relationships with intentional quality time","Use your social skills to include people who struggle with connection","Make sure you're comfortable being alone too"]},
    mid:{s:"Some solid relationships but room to grow — in depth, authenticity, communication, or simply the number of people you can rely on.",t:["Reach out to one person you've lost touch with","Practice expressing one need directly instead of hinting","Think about where you're performing vs. being authentic","Consider joining a new group to meet people outside your usual circle"]},
    low:{s:"Loneliness, inauthenticity, one-sided dynamics, or communication challenges are affecting your wellbeing.",t:["Start small — one meaningful conversation per day","Identify what's holding you back: anxiety, trust, time, past hurt?","Quality over quantity — invest in 2-3 relationships","If relationships feel one-sided, it may be time for a difficult conversation","Consider what walls you've built that might be hurting you now"]},
  },
  intellectual: {
    high:{s:"You're intellectually engaged and curious. You seek growth, think critically, and actively challenge your mind.",t:["Share your knowledge — teaching deepens understanding","Tackle something outside your usual areas","Apply your curiosity to your weaker wellness areas"]},
    mid:{s:"You engage your mind in some areas but could push more. Passive consumption may have replaced active thinking.",t:["Replace 30 minutes of scrolling with active learning daily","Find a topic that genuinely excites you and dive in","Practice forming and defending your own opinions","Have one conversation about ideas, not just events"]},
    low:{s:"Intellectual engagement is low. This doesn't mean you're not smart — it means you're not actively challenging your mind.",t:["Start with what interests YOU, not what you 'should' learn","Try one podcast, book, or documentary this week","Notice how much time goes to passive consumption vs. active thinking","Your brain is a muscle — even small daily challenges keep it sharp"]},
  },
  financial: {
    high:{s:"Strong financial habits, literacy, and sense of control. You're ahead of most people your age.",t:["Start learning about investing — compound growth is your friend","Share financial knowledge with friends","Set bigger financial goals — you have the foundation"]},
    mid:{s:"Some awareness but gaps remain — budgeting, savings, literacy, or your emotional relationship with money.",t:["Track every dollar for one month","Set up automatic transfers to savings, even $10-25/month","Learn one concept: compound interest, credit scores, or budgeting methods","If you're avoiding your bank account, that avoidance IS the problem"]},
    low:{s:"Financial wellness is a major growth area. Stress, avoidance, impulse spending, or lack of knowledge are holding you back. This is common and fixable.",t:["Don't shame yourself — financial literacy is a skill, not a character trait","Start with ONE thing: download a budgeting app and track spending for 2 weeks","Learn how credit scores work — check yours free through most banks","If you're avoiding your money, commit to checking your account today","Small changes compound over time, just like interest"]},
  },
  occupational: {
    high:{s:"Clear direction, engagement, purpose, and healthy balance. You're building toward something.",t:["Keep developing skills — don't stagnate","Mentor someone earlier in their journey","Check that your direction still aligns with your evolving values"]},
    mid:{s:"Some direction but you may feel uncertain, unfulfilled, or out of balance. You might know what you don't want but not what you do.",t:["Talk to 3 people in fields that interest you","Identify your top 3 strengths and brainstorm roles using all three","If you're on someone else's path, start exploring what YOU want","Set one professional development goal for the next 90 days"]},
    low:{s:"Career direction, purpose, or balance is a significant challenge. You may feel lost, burned out, or on someone else's path.",t:["It's okay to not know — but keep exploring. Try one new thing this month.","If burned out, fix that first before making big decisions","What are you good at AND enjoy? The overlap is where your career lives","Give yourself permission to question the path others chose for you","Talk to a career counselor, mentor, or trusted friend"]},
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   SCORING
   ═══════════════════════════════════════════════════════════════════════════ */

function score(ans,qs){if(!ans||!ans.length)return 0;let t=0;qs.forEach((q,i)=>{const r=ans[i]??3;t+=q.dir===1?r:6-r;});return Math.round((t/(qs.length*6))*100);}
function wLvl(s){return s>=65?"high":s>=40?"mid":"low";}
function pLvl(s){return s>=55?"high":"low";}

/* ═══════════════════════════════════════════════════════════════════════════
   LOCAL STORAGE
   ═══════════════════════════════════════════════════════════════════════════ */

const SAVE_KEY = "know_yourself_data";
function saveData(d){try{localStorage.setItem(SAVE_KEY,JSON.stringify(d));}catch(e){}}
function loadData(){try{const d=localStorage.getItem(SAVE_KEY);return d?JSON.parse(d):null;}catch(e){return null;}}
function clearData(){try{localStorage.removeItem(SAVE_KEY);}catch(e){}}

/* ═══════════════════════════════════════════════════════════════════════════
   PDF EXPORT
   ═══════════════════════════════════════════════════════════════════════════ */

function exportPDF(name, pScores, wScores, pKeys, wKeys) {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  let y = 20;
  const margin = 20;
  const lineW = W - margin * 2;

  function checkPage(need) {
    if (y + need > H - 20) { doc.addPage(); y = 20; }
  }

  // Title
  doc.setFont("helvetica", "bold"); doc.setFontSize(24); doc.setTextColor(45, 45, 45);
  doc.text(`${name}'s Complete Profile`, W / 2, y, { align: "center" }); y += 8;
  doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(150);
  doc.text("Know Yourself \u2014 Personality & Wellness Assessment", W / 2, y, { align: "center" }); y += 4;
  doc.text(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), W / 2, y, { align: "center" }); y += 12;

  // Top 3 Priorities
  const top3 = getTop3(pScores, wScores, name);
  doc.setDrawColor(200); doc.line(margin, y, W - margin, y); y += 8;
  doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(61, 64, 91);
  doc.text("\u{1F3AF} YOUR TOP 3 PRIORITIES", margin, y); y += 6;
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(120);
  doc.text("If you do nothing else, focus here. Ranked by impact based on your unique profile.", margin, y); y += 8;
  top3.forEach(p => {
    checkPage(30);
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(45, 45, 45);
    doc.text(`#${p.rank}  ${p.icon} ${p.label} (${p.score}%)`, margin, y); y += 6;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(80);
    const whyLines = doc.splitTextToSize(p.why, lineW);
    doc.text(whyLines, margin, y); y += whyLines.length * 4.5 + 2;
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(61, 64, 91);
    doc.text("Your One Action:", margin, y); y += 4;
    doc.setFont("helvetica", "normal"); doc.setTextColor(80);
    const doLines = doc.splitTextToSize(p.doThis, lineW);
    doc.text(doLines, margin, y); y += doLines.length * 4 + 8;
  });

  // Personality Section
  doc.setDrawColor(200); doc.line(margin, y, W - margin, y); y += 8;
  doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(61, 64, 91);
  doc.text("Personality Profile (Big Five)", margin, y); y += 8;

  pKeys.forEach(k => {
    checkPage(40);
    const d = BIG5[k], s = pScores[k], ins = P_INS[k][pLvl(s)];
    // Trait header
    doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(45, 45, 45);
    doc.text(`${d.label}: ${s}%  \u2014  ${ins.title}`, margin, y); y += 6;
    // Description
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(80);
    const descLines = doc.splitTextToSize(ins.desc, lineW);
    doc.text(descLines, margin, y); y += descLines.length * 4.5 + 2;
    // Real life
    doc.setFont("helvetica", "italic"); doc.setFontSize(9); doc.setTextColor(100);
    const rlLines = doc.splitTextToSize("Real Life: " + ins.realLife, lineW);
    checkPage(rlLines.length * 4);
    doc.text(rlLines, margin, y); y += rlLines.length * 4 + 2;
    // Strengths
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(80);
    doc.text("Strengths: ", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(ins.strengths.join(" \u2022 "), margin + 18, y); y += 5;
    // Watch outs
    doc.setFont("helvetica", "bold");
    doc.text("Watch For: ", margin, y);
    doc.setFont("helvetica", "normal");
    const woText = doc.splitTextToSize(ins.watchOuts.join(" \u2022 "), lineW - 20);
    doc.text(woText, margin + 20, y); y += woText.length * 4 + 2;
    // Exercises
    checkPage(20);
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(61, 64, 91);
    doc.text("Try This Week:", margin, y); y += 4;
    doc.setFont("helvetica", "normal"); doc.setTextColor(80);
    ins.exercises.forEach(e => {
      checkPage(10);
      const eLines = doc.splitTextToSize("\u2192 " + e, lineW - 4);
      doc.text(eLines, margin + 2, y); y += eLines.length * 4 + 1;
    });
    y += 1;
    // Reflection
    checkPage(12);
    doc.setFont("helvetica", "italic"); doc.setFontSize(9); doc.setTextColor(100);
    const refLines = doc.splitTextToSize("Reflection: " + ins.reflection, lineW);
    doc.text(refLines, margin, y); y += refLines.length * 4 + 6;
  });

  // Cross-trait
  const cross = getCross(pScores, name);
  if (cross.length > 0) {
    checkPage(20);
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(61, 64, 91);
    doc.text("How Your Traits Interact", margin, y); y += 7;
    cross.forEach(c => {
      checkPage(15);
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(80);
      doc.text(c.i + " " + c.t, margin, y); y += 4;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(80);
      const cLines = doc.splitTextToSize(c.x, lineW);
      doc.text(cLines, margin, y); y += cLines.length * 4 + 4;
    });
  }

  // Wellness Section
  doc.addPage(); y = 20;
  doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(61, 64, 91);
  doc.text("Wellness Profile", margin, y); y += 10;

  wKeys.forEach(k => {
    checkPage(30);
    const d = WELL[k], s = wScores[k], lv = wLvl(s), ins = W_INS[k][lv];
    doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(45, 45, 45);
    doc.text(`${d.icon} ${d.label}: ${s}%`, margin, y); y += 6;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(80);
    const sLines = doc.splitTextToSize(ins.s, lineW);
    doc.text(sLines, margin, y); y += sLines.length * 4.5 + 3;
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(61, 64, 91);
    doc.text("Action Steps:", margin, y); y += 4;
    doc.setFont("helvetica", "normal"); doc.setTextColor(80);
    ins.t.forEach(tip => {
      checkPage(10);
      const tLines = doc.splitTextToSize("\u2192 " + tip, lineW - 4);
      doc.text(tLines, margin + 2, y); y += tLines.length * 4 + 1;
    });
    y += 6;
  });

  // PW Cross
  const pwc = getPWCross(pScores, wScores, name);
  if (pwc.length > 0) {
    checkPage(20);
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(61, 64, 91);
    doc.text("Personality \u00D7 Wellness Insights", margin, y); y += 7;
    pwc.forEach(c => {
      checkPage(15);
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(80);
      doc.text(c.i + " " + c.t, margin, y); y += 4;
      doc.setFont("helvetica", "normal");
      const cLines = doc.splitTextToSize(c.x, lineW);
      doc.text(cLines, margin, y); y += cLines.length * 4 + 4;
    });
  }

  doc.save(`${name}_Know_Yourself_Profile.pdf`);
}

/* ═══════════════════════════════════════════════════════════════════════════
   UI COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

const fonts = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');`;
const base = `*{box-sizing:border-box;margin:0;padding:0}body{font-family:'IBM Plex Sans',sans-serif;-webkit-font-smoothing:antialiased}`;

function Radar({data,size=300}){
  const cx=size/2,cy=size/2,R=size*0.36,N=5,a=(Math.PI*2)/data.length;
  const pt=(ang,r)=>({x:cx+r*Math.sin(ang),y:cy-r*Math.cos(ang)});
  const grid=[];for(let l=1;l<=N;l++){const r=(R/N)*l;grid.push(data.map((_,i)=>pt(a*i,r)).map(p=>`${p.x},${p.y}`).join(" "));}
  const dp=data.map((d,i)=>pt(a*i,(d.value/100)*R));
  return(<svg viewBox={`0 0 ${size} ${size}`} style={{width:"100%",maxWidth:size}}>
    {grid.map((g,i)=><polygon key={i} points={g} fill="none" stroke="rgba(150,150,150,0.2)" strokeWidth="1"/>)}
    {data.map((_,i)=>{const e=pt(a*i,R);return<line key={i} x1={cx} y1={cy} x2={e.x} y2={e.y} stroke="rgba(150,150,150,0.15)" strokeWidth="1"/>;}) }
    <polygon points={dp.map(p=>`${p.x},${p.y}`).join(" ")} fill="rgba(129,178,154,0.25)" stroke="#81B29A" strokeWidth="2.5"/>
    {dp.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="5" fill={data[i].color} stroke="#fff" strokeWidth="2"/>)}
    {data.map((d,i)=>{const lp=pt(a*i,R+28);return<text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="500" fill="#555" fontFamily="'IBM Plex Sans',sans-serif">{d.short||d.label}</text>;})}
  </svg>);
}

function Bar({value,color,label}){return(
  <div style={{marginBottom:14}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:13,fontWeight:500,color:"#444"}}><span>{label}</span><span style={{color}}>{value}%</span></div>
    <div style={{height:10,borderRadius:5,background:"rgba(0,0,0,0.06)",overflow:"hidden"}}><div style={{height:"100%",width:`${value}%`,background:color,borderRadius:5,transition:"width 1s ease"}}/></div>
  </div>
);}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════════════════ */

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [name, setName] = useState("");
  const [curSec, setCurSec] = useState(null);
  const [curQ, setCurQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState([]);
  const ref = useRef(null);
  const up = () => setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth" }), 100);

  const pK = Object.keys(BIG5), wK = Object.keys(WELL);
  const sec = curSec ? (BIG5[curSec] || WELL[curSec]) : null;
  const qs = sec?.questions || [];

  // Load saved data on mount
  useEffect(() => {
    const d = loadData();
    if (d && d.name) { setName(d.name); setAnswers(d.answers || {}); setCompleted(d.completed || []); setScreen("hub"); }
  }, []);

  // Save on changes
  const doSave = useCallback(() => {
    if (name) saveData({ name, answers, completed });
  }, [name, answers, completed]);
  useEffect(() => { doSave(); }, [doSave]);

  function answer(v) {
    const k = curSec, na = { ...answers, [k]: [...(answers[k] || []), v] };
    setAnswers(na);
    if (curQ + 1 < qs.length) setCurQ(curQ + 1);
    else { const nc = [...completed, k]; setCompleted(nc); setCurSec(null); setCurQ(0); setScreen("hub"); up(); }
  }
  function start(k) { setCurSec(k); setCurQ(0); setScreen("questions"); up(); }

  const pDone = pK.every(k => completed.includes(k));
  const wDone = wK.every(k => completed.includes(k));
  const allDone = pDone && wDone;

  const pS = {}; pK.forEach(k => { if (answers[k]) pS[k] = score(answers[k], BIG5[k].questions); });
  const wS = {}; wK.forEach(k => { if (answers[k]) wS[k] = score(answers[k], WELL[k].questions); });

  const pg = { minHeight: "100vh", background: "linear-gradient(160deg, #faf9f6 0%, #f0ece2 100%)", padding: 24 };
  const card = { background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.04)", marginBottom: 16 };
  const btnS = (bg) => ({ width: "100%", padding: "14px", background: bg || "#3D405B", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif" });

  // ── WELCOME ──
  if (screen === "welcome") {
    return (
      <div style={{ ...pg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{fonts}{base}</style>
        <div ref={ref} style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{"\u25C9"}</div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: "#2d2d2d", marginBottom: 8 }}>Know Yourself</h1>
          <p style={{ fontSize: 15, color: "#777", marginBottom: 40, lineHeight: 1.6 }}>A personality & wellness profile built around who you actually are.</p>
          <div style={{ textAlign: "left", ...card, padding: 28, borderRadius: 16, boxShadow: "0 2px 20px rgba(0,0,0,0.06)", marginBottom: 32 }}>
            <p style={{ fontSize: 14, color: "#888", marginBottom: 16, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>What you'll discover</p>
            <div style={{ fontSize: 15, color: "#555", lineHeight: 1.8 }}>
              <p style={{ marginBottom: 8 }}>{"\u{1F9EC}"} <strong>Personality profile</strong> — 60 questions across the Big Five</p>
              <p style={{ marginBottom: 8 }}>{"\u{1F9E0}"} <strong>Mental wellness</strong> — stress, sleep, coping, self-talk</p>
              <p style={{ marginBottom: 8 }}>{"\u{1F91D}"} <strong>Social wellness</strong> — relationships, boundaries, authenticity</p>
              <p style={{ marginBottom: 8 }}>{"\u{1F4DA}"} <strong>Intellectual wellness</strong> — curiosity, critical thinking, growth</p>
              <p style={{ marginBottom: 8 }}>{"\u{1F4B0}"} <strong>Financial wellness</strong> — habits, literacy, planning</p>
              <p>{"\u{1F3AF}"} <strong>Occupational wellness</strong> — purpose, direction, balance</p>
            </div>
          </div>
          <input type="text" placeholder="Your first name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && name.trim()) setScreen("hub"); }}
            style={{ width: "100%", padding: "14px 20px", fontSize: 16, border: "2px solid #e0ddd5", borderRadius: 12, outline: "none", fontFamily: "'IBM Plex Sans', sans-serif", background: "#fff", marginBottom: 16 }}
            onFocus={e => e.target.style.borderColor = "#81B29A"} onBlur={e => e.target.style.borderColor = "#e0ddd5"} />
          <button onClick={() => { if (name.trim()) setScreen("hub"); }} disabled={!name.trim()}
            style={{ ...btnS(name.trim() ? "#3D405B" : "#ccc"), padding: "16px", fontSize: 16, cursor: name.trim() ? "pointer" : "default" }}>Let's Go</button>
          <p style={{ fontSize: 12, color: "#aaa", marginTop: 16 }}>120 questions {"\u00B7"} ~15 min personality {"\u00B7"} ~15 min wellness {"\u00B7"} Progress saves automatically</p>
        </div>
      </div>
    );
  }

  // ── HUB ──
  if (screen === "hub") {
    const Row = ({ k, d, isDone, locked, sc }) => (
      <button onClick={() => !isDone && !locked && start(k)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: locked ? "#f5f3ee" : "#fff", border: isDone ? `2px solid ${d.color}` : "2px solid #e8e5dd", borderRadius: 12, cursor: locked || isDone ? "default" : "pointer", textAlign: "left", fontFamily: "'IBM Plex Sans', sans-serif", opacity: locked ? 0.5 : isDone ? 0.85 : 1, width: "100%" }}>
        <div><div style={{ fontWeight: 600, fontSize: 15, color: "#2d2d2d" }}>{d.icon ? d.icon + " " : ""}{d.label}</div><div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{d.subtitle}</div></div>
        {isDone ? <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 20, fontWeight: 700, color: d.color }}>{sc}%</span><span style={{ color: "#81B29A", fontSize: 18 }}>{"\u2713"}</span></div>
          : locked ? <span style={{ color: "#ccc", fontSize: 16 }}>{"\u{1F512}"}</span>
          : <span style={{ color: "#bbb", fontSize: 13, fontWeight: 500 }}>Start {"\u2192"}</span>}
      </button>
    );
    return (
      <div style={pg}>
        <style>{fonts}{base}</style>
        <div ref={ref} style={{ maxWidth: 540, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32, paddingTop: 16 }}>
            <p style={{ fontSize: 14, color: "#999", fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>Welcome back</p>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#2d2d2d" }}>{name}'s Profile</h1>
          </div>
          {/* Personality */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}><span style={{ fontSize: 20 }}>{"\u{1F9EC}"}</span><h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#2d2d2d" }}>Personality Profile</h2>{pDone && <span style={{ background: "#81B29A", color: "#fff", fontSize: 11, padding: "2px 10px", borderRadius: 20, fontWeight: 600 }}>COMPLETE</span>}</div>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>Big Five / OCEAN — 12 questions per trait, 60 total.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{pK.map(k => <Row key={k} k={k} d={BIG5[k]} isDone={completed.includes(k)} locked={false} sc={pS[k]} />)}</div>
            {pDone && <button onClick={() => { setScreen("p-results"); up(); }} style={{ ...btnS(), marginTop: 16 }}>View Personality Results</button>}
          </div>
          {/* Wellness */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}><span style={{ fontSize: 20 }}>{"\u2696\uFE0F"}</span><h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#2d2d2d" }}>Wellness Assessment</h2>{wDone && <span style={{ background: "#81B29A", color: "#fff", fontSize: 11, padding: "2px 10px", borderRadius: 20, fontWeight: 600 }}>COMPLETE</span>}</div>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>{pDone ? "12 questions per dimension, 60 total." : "Complete personality first — it provides context."}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{wK.map(k => <Row key={k} k={k} d={WELL[k]} isDone={completed.includes(k)} locked={!pDone} sc={wS[k]} />)}</div>
            {wDone && <button onClick={() => { setScreen("w-results"); up(); }} style={{ ...btnS(), marginTop: 16 }}>View Wellness Results</button>}
          </div>
          {allDone && <>
            <button onClick={() => { setScreen("full"); up(); }} style={{ ...btnS("linear-gradient(135deg,#81B29A 0%,#3D405B 100%)"), padding: "18px", fontSize: 17, fontWeight: 700, boxShadow: "0 4px 20px rgba(61,64,91,0.3)", marginBottom: 12 }}>{"\u25C9"} View Complete Profile</button>
            <button onClick={() => exportPDF(name, pS, wS, pK, wK)} style={{ ...btnS("#E07A5F"), marginBottom: 12 }}>{"\u{1F4E5}"} Download PDF Report</button>
          </>}
          <button onClick={() => { if (window.confirm("This will erase all your progress. Are you sure?")) { clearData(); setName(""); setAnswers({}); setCompleted([]); setScreen("welcome"); } }}
            style={{ width: "100%", padding: "10px", background: "transparent", color: "#ccc", border: "1px solid #e8e5dd", borderRadius: 10, fontSize: 12, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", marginTop: 8, marginBottom: 40 }}>
            Reset All Progress
          </button>
        </div>
      </div>
    );
  }

  // ── QUESTIONS ──
  if (screen === "questions" && sec) {
    const prog = ((curQ + 1) / qs.length) * 100;
    return (
      <div style={pg}>
        <style>{fonts}{base}</style>
        <div ref={ref} style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingTop: 8 }}>
            <button onClick={() => { setScreen("hub"); setCurSec(null); setCurQ(0); const a = { ...answers }; delete a[curSec]; setAnswers(a); }}
              style={{ background: "none", border: "none", color: "#999", fontSize: 14, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif" }}>{"\u2190"} Back</button>
            <span style={{ fontSize: 13, color: "#aaa" }}>{curQ + 1} of {qs.length}</span>
          </div>
          <div style={{ marginBottom: 24 }}><div style={{ height: 4, background: "rgba(0,0,0,0.06)", borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", width: `${prog}%`, background: sec.color, borderRadius: 2, transition: "width 0.4s ease" }} /></div></div>
          <div style={{ textAlign: "center", marginBottom: 8 }}><span style={{ fontSize: 12, fontWeight: 600, color: sec.color, textTransform: "uppercase", letterSpacing: 1 }}>{sec.label}</span></div>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 2px 24px rgba(0,0,0,0.06)", textAlign: "center", marginBottom: 16 }}>
            <p style={{ fontSize: 19, fontWeight: 500, color: "#2d2d2d", lineHeight: 1.5, marginBottom: qs[curQ].desc ? 12 : 36, fontFamily: "'DM Serif Display', serif" }}>"{qs[curQ].text}"</p>
            {qs[curQ].desc && <p style={{ fontSize: 13, color: "#999", lineHeight: 1.5, marginBottom: 28, fontStyle: "italic", padding: "0 8px" }}>{qs[curQ].desc}</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SCALE.map((l, i) => (
                <button key={i} onClick={() => answer(i)}
                  style={{ padding: "12px 16px", background: "transparent", border: "2px solid #e8e5dd", borderRadius: 10, fontSize: 14, fontWeight: 500, color: "#555", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.target.style.borderColor = sec.color; e.target.style.background = sec.color + "12"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "#e8e5dd"; e.target.style.background = "transparent"; }}>{l}</button>
              ))}
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#bbb", textAlign: "center" }}>Answer honestly — no right or wrong answers.</p>
        </div>
      </div>
    );
  }

  // ── PERSONALITY RESULTS ──
  if (screen === "p-results") {
    const rd = pK.map(k => ({ label: BIG5[k].label, short: BIG5[k].label.length > 10 ? BIG5[k].label.slice(0, 9) + "." : BIG5[k].label, value: pS[k], color: BIG5[k].color }));
    const cross = getCross(pS, name);
    return (
      <div style={pg}>
        <style>{fonts}{base}</style>
        <div ref={ref} style={{ maxWidth: 540, margin: "0 auto" }}>
          <button onClick={() => setScreen("hub")} style={{ background: "none", border: "none", color: "#999", fontSize: 14, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", marginBottom: 16, paddingTop: 8 }}>{"\u2190"} Back to Hub</button>
          <div style={{ textAlign: "center", marginBottom: 32 }}><h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#2d2d2d" }}>{name}'s Personality</h1><p style={{ fontSize: 14, color: "#999", marginTop: 4 }}>Big Five / OCEAN Model</p></div>
          <div style={{ ...card, borderRadius: 20, padding: 24, boxShadow: "0 2px 20px rgba(0,0,0,0.06)", display: "flex", justifyContent: "center", marginBottom: 24 }}><Radar data={rd} /></div>
          {cross.length > 0 && (
            <div style={{ background: "linear-gradient(135deg,#3D405B 0%,#52566e 100%)", borderRadius: 20, padding: 24, marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#fff", marginBottom: 8 }}>{"\u{1F517}"} How Your Traits Interact</h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>These combinations are where the real insight lives.</p>
              {cross.map((c, i) => (<div key={i} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 16, marginBottom: 10 }}><div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{c.i} {c.t}</div><span style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", lineHeight: 1.6 }}>{c.x}</span></div>))}
            </div>
          )}
          {pK.map(k => {
            const d = BIG5[k], s = pS[k], ins = P_INS[k][pLvl(s)];
            return (
              <div key={k} style={{ ...card, borderLeft: `4px solid ${d.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#2d2d2d" }}>{d.label}</h3><span style={{ fontSize: 22, fontWeight: 700, color: d.color }}>{s}%</span></div>
                <div style={{ fontSize: 13, fontWeight: 600, color: d.color, marginBottom: 8 }}>{ins.title}</div>
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>{ins.desc}</p>
                <div style={{ background: "#faf9f6", borderRadius: 10, padding: 14, marginBottom: 16 }}><p style={{ fontSize: 12, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>What This Means In Real Life</p><p style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{ins.realLife}</p></div>
                <div style={{ marginBottom: 12 }}><p style={{ fontSize: 12, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Strengths</p><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{ins.strengths.map((s, i) => <span key={i} style={{ fontSize: 12, background: d.color + "18", color: d.color, padding: "4px 10px", borderRadius: 20, fontWeight: 500 }}>{s}</span>)}</div></div>
                <div style={{ marginBottom: 12 }}><p style={{ fontSize: 12, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Watch Out For</p><div style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>{ins.watchOuts.map((w, i) => <p key={i} style={{ marginBottom: 4 }}>{"\u2022"} {w}</p>)}</div></div>
                <div style={{ marginBottom: 12 }}><p style={{ fontSize: 12, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Try This Week</p><div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{ins.exercises.map((e, i) => <p key={i} style={{ marginBottom: 8, paddingLeft: 8, borderLeft: `2px solid ${d.color}40` }}>{e}</p>)}</div></div>
                <div style={{ background: d.color + "10", borderRadius: 10, padding: 14 }}><p style={{ fontSize: 12, fontWeight: 600, color: d.color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{"\u{1F4AD}"} Reflection Prompt</p><p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, fontStyle: "italic" }}>{ins.reflection}</p></div>
              </div>
            );
          })}
          <button onClick={() => setScreen("hub")} style={{ ...btnS(), marginTop: 8, marginBottom: 40 }}>Back to Hub</button>
        </div>
      </div>
    );
  }

  // ── WELLNESS / FULL RESULTS ──
  if (screen === "w-results" || screen === "full") {
    const showP = screen === "full";
    const wr = wK.map(k => ({ label: WELL[k].label.replace(" Wellness", ""), short: WELL[k].label.replace(" Wellness", ""), value: wS[k], color: WELL[k].color }));
    const pr = pK.map(k => ({ label: BIG5[k].label, short: BIG5[k].label.length > 10 ? BIG5[k].label.slice(0, 9) + "." : BIG5[k].label, value: pS[k], color: BIG5[k].color }));
    const pwIns = showP ? getPWCross(pS, wS, name) : [];
    return (
      <div style={pg}>
        <style>{fonts}{base}</style>
        <div ref={ref} style={{ maxWidth: 540, margin: "0 auto" }}>
          <button onClick={() => setScreen("hub")} style={{ background: "none", border: "none", color: "#999", fontSize: 14, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", marginBottom: 16, paddingTop: 8 }}>{"\u2190"} Back to Hub</button>
          <div style={{ textAlign: "center", marginBottom: 32 }}><div style={{ fontSize: 40, marginBottom: 4 }}>{"\u25C9"}</div><h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#2d2d2d" }}>{showP ? `${name}'s Complete Profile` : `${name}'s Wellness Profile`}</h1></div>
          {showP && (() => { const top3 = getTop3(pS, wS, name); return (
            <div style={{ background: "linear-gradient(135deg, #E07A5F 0%, #D4A04A 50%, #81B29A 100%)", borderRadius: 20, padding: 3, marginBottom: 24 }}>
              <div style={{ background: "#faf9f6", borderRadius: 18, padding: 24 }}>
                <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#2d2d2d", marginBottom: 4, textAlign: "center" }}>{"\u{1F3AF}"} Your Top 3 Priorities</h2>
                <p style={{ fontSize: 13, color: "#999", textAlign: "center", marginBottom: 20 }}>If you do nothing else, focus here. Ranked by impact based on your unique profile.</p>
                {top3.map((p, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 14, padding: 20, marginBottom: i < 2 ? 12 : 0, borderLeft: `4px solid ${p.color}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: p.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: p.color, fontFamily: "'DM Serif Display', serif", flexShrink: 0 }}>{p.rank}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15, color: "#2d2d2d" }}>{p.icon} {p.label}</div>
                        <div style={{ fontSize: 12, color: p.color, fontWeight: 600 }}>Score: {p.score}%</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 10 }}>{p.why}</p>
                    <div style={{ background: p.color + "10", borderRadius: 8, padding: 12 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: p.color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{"\u{1F4CC}"} Your One Action</p>
                      <p style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>{p.doThis}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ); })()}
          {showP && (
            <div style={{ ...card, borderRadius: 20, padding: 24, boxShadow: "0 2px 20px rgba(0,0,0,0.06)", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#2d2d2d", marginBottom: 16, textAlign: "center" }}>Personality Profile</h2>
              <div style={{ display: "flex", justifyContent: "center" }}><Radar data={pr} size={260} /></div>
              <div style={{ marginTop: 16 }}>{pK.map(k => <Bar key={k} value={pS[k]} color={BIG5[k].color} label={BIG5[k].label} />)}</div>
            </div>
          )}
          <div style={{ ...card, borderRadius: 20, padding: 24, boxShadow: "0 2px 20px rgba(0,0,0,0.06)", marginBottom: 24 }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#2d2d2d", marginBottom: 16, textAlign: "center" }}>Wellness Dashboard</h2>
            <div style={{ display: "flex", justifyContent: "center" }}><Radar data={wr} size={260} /></div>
            <div style={{ marginTop: 16 }}>{wK.map(k => <Bar key={k} value={wS[k]} color={WELL[k].color} label={WELL[k].label} />)}</div>
          </div>
          {pwIns.length > 0 && (
            <div style={{ background: "linear-gradient(135deg,#3D405B 0%,#52566e 100%)", borderRadius: 20, padding: 24, marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#fff", marginBottom: 8 }}>{"\u{1F517}"} Personality {"\u00D7"} Wellness Insights</h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>Connecting who you are to how you're doing.</p>
              {pwIns.map((c, i) => (<div key={i} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 16, marginBottom: 10 }}><div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{c.i} {c.t}</div><span style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", lineHeight: 1.6 }}>{c.x}</span></div>))}
            </div>
          )}
          {wK.map(k => {
            const d = WELL[k], s = wS[k], lv = wLvl(s), ins = W_INS[k][lv];
            return (
              <div key={k} style={{ ...card, borderLeft: `4px solid ${d.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#2d2d2d" }}>{d.icon} {d.label}</h3><span style={{ fontSize: 22, fontWeight: 700, color: d.color }}>{s}%</span></div>
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6, marginBottom: 16 }}>{ins.s}</p>
                <div><p style={{ fontSize: 12, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Action Steps</p><div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{ins.t.map((t, i) => <p key={i} style={{ marginBottom: 6, paddingLeft: 8, borderLeft: `2px solid ${d.color}40` }}>{t}</p>)}</div></div>
              </div>
            );
          })}
          {showP && <button onClick={() => exportPDF(name, pS, wS, pK, wK)} style={{ ...btnS("#E07A5F"), marginTop: 8, marginBottom: 12 }}>{"\u{1F4E5}"} Download PDF Report</button>}
          <button onClick={() => setScreen("hub")} style={{ ...btnS(), marginTop: 4, marginBottom: 40 }}>Back to Hub</button>
        </div>
      </div>
    );
  }

  return null;
}
