import{j as e}from"./framer-motion-DK4w1u5J.js";import{r as p,L as f}from"./react-vendor-iD-Vihsm.js";import{u as C,B as b,a as v,U as T,S as R}from"./index-C1Nscwxq.js";import{N as A}from"./Navbar-B9clY3vd.js";import{C as w,A as L,F as M}from"./Footer-BhwiF1cN.js";import{H as D}from"./house-Bp7fRwxZ.js";import{S as B}from"./sparkles-BsqjqIc1.js";import"./radix-ui-C89142jh.js";import"./charts-DghROoNg.js";function F(u,o,l,c){const a=[];return c==="good"?a.push("Why does this business show good potential?"):c==="caution"?a.push("What are the main risks I should watch out for?"):a.push("Should I consider a different business?"),a.push(`What if I invest ₹${Math.round(l*.5/1e3)}K instead of ₹${Math.round(l/1e3)}K?`,"Which customer groups should I target first?","Can I comfortably repay this loan?",`Why is competition important in ${o}?`),a}function E(u,o,l,c,a){const r=u.toLowerCase(),t=a;if(r.includes("why")&&r.includes("potential"))return`Based on the analysis for ${o} in ${l}:

Your business shows ${t?.verdict==="good"?"strong":"moderate"} potential because:

1. Market Reach: The area has approximately ${t?.marketReach.households?.toLocaleString("en-IN")||"4,200"} households within reach, providing a solid customer base.

2. Competition: With ${t?.competition.totalBusinesses||"18"} existing competitors, the density is ${t?.competition.density||"moderate"}. ${t?.competition.density==="low"?"This means less competition to worry about.":"You will need to differentiate your offering."}

3. Financial Structure: Your ₹${(c/1e3).toFixed(0)}K contribution through ${t?.financial.recommendedScheme||"the recommended scheme"} creates a manageable repayment structure.

Remember: This analysis is based on simulated market data for demonstration purposes.`;if(r.includes("risk")||r.includes("watch out")){const s=t?.risks||[];return s.length===0?"The analysis did not identify major risks for this scenario. However, every business carries inherent risks such as market changes, supply disruptions, and seasonal demand variations.":`Here are the key risks identified for ${o}:

${s.map((i,d)=>`${d+1}. ${i.name} (${i.severity.toUpperCase()}): ${i.explanation}
   Mitigation: ${i.mitigation}`).join(`

`)}

The overall risk score is ${t?.subScores?.riskScore||"N/A"}/100. ${t?.subScores?.riskScore&&t.subScores.riskScore>=70?"This is within acceptable range.":"This area deserves careful attention."}`}if(r.includes("invest")||r.includes("capital")||r.includes("₹")){const s=c*.5,i=s/.1;return`If you reduce your contribution to ₹${s.toLocaleString("en-IN")}:

• Project Cost would be: ₹${i.toLocaleString("en-IN")} (at 10% contribution)
• This falls within the ${i<=14e4?"Micro Finance scheme (max ₹1.25L)":"Term Loan scheme (max ₹45L)"}
• Your loan would be approximately ₹${(i*.9).toLocaleString("en-IN")}

⚠️ A lower contribution means a smaller initial setup. Consider whether this covers your essential equipment and inventory needs.

The financial engine can recalculate this for you with exact numbers.`}if(r.includes("customer")||r.includes("target")){const s=t?.marketReach.customerGroups||[];return`Based on the market analysis for ${l}:

Primary customer groups to target:
${s.map((i,d)=>`${d+1}. ${i}`).join(`
`)}

Recommended approach:
• Start with the highest-relevance group (${s[0]||"Households"})
• Build trust through consistent quality and fair pricing
• Expand to adjacent groups once established
• Consider weekly haat (market day) for wider reach`}if(r.includes("repay")||r.includes("loan")||r.includes("emi")){const s=t?.financial.affordability;return s?`Repayment analysis for your ${t?.financial.recommendedScheme||"scheme"}:

• Monthly Repayment: ~₹${s.monthlyRepayment.toLocaleString("en-IN")}
• Expected Monthly Revenue: ₹${s.expectedRevenue.toLocaleString("en-IN")}
• Operating Costs: ₹${s.operatingCosts.toLocaleString("en-IN")}
• Monthly Cash Flow: ₹${s.cashFlow.toLocaleString("en-IN")}

Rating: ${s.ratingIcon} ${s.ratingLabel}

${s.rating==="comfortable"?"Your expected cash flow comfortably covers the loan repayment. This is a positive sign.":s.rating==="tight"?"The repayment is manageable but leaves limited margin. Careful cost control will be important.":"The repayment burden is high relative to expected revenue. Consider reducing the loan amount or exploring alternative financing."}`:"I cannot assess repayment comfort without financial data. Please run an assessment first."}if(r.includes("competition")||r.includes("competitor"))return`Competition analysis for ${o} in ${l}:

${t?.competition.totalBusinesses||"N"} competing businesses found within the analysis radius.

Competition density: ${t?.competition.density?.toUpperCase()||"MEDIUM"}

Key competitors:
${t?.competition.competitors.slice(0,5).map(s=>`• ${s.name} (${s.type}) — ${s.distance}`).join(`
`)||"• Analysis data loading..."}

To compete effectively:
1. Differentiate through service quality and reliability
2. Offer products/services competitors don't
3. Build customer loyalty through consistent experience
4. Consider competitive pricing for initial market entry`;if(r.includes("different business")||r.includes("another business")||r.includes("alternative")){const s=t?.opportunity.alternatives||[];return`If you are considering alternatives to ${o}:

Suggested alternatives based on your location:
${s.length>0?s.map((i,d)=>`${d+1}. ${i}`).join(`
`):`1. Organic produce supply
2. Cold storage services
3. Digital payment services`}

The market gap analysis shows: ${t?.opportunity.underserved||"underserved categories exist in your area."}

You can use the What-If Simulator to compare different business options with the same location and capital.`}return`Based on your assessment of ${o} in ${l} with ₹${(c/1e3).toFixed(0)}K contribution:

The overall feasibility score is ${t?.overallScore||"N/A"}/100 with a verdict of "${t?.verdictLabel||"Analyzing"}".

${t?.decision?.summary||"The analysis covers market reach, competition, risks, financial structure and recommended next steps."}

Feel free to ask about specific aspects like:
• Market reach and customer groups
• Competition and pricing
• Financial structure and repayment
• Risks and mitigations
• Alternative business options`}function z(){const{feasibility:u,location:o,business:l,capital:c}=C(),[a,r]=p.useState([]),[t,s]=p.useState(""),[i,d]=p.useState(!1),j=p.useRef(null),N=()=>{j.current?.scrollIntoView({behavior:"smooth"})};p.useEffect(()=>{N()},[a]);const x=l?.name||"your business",g=o?`${o.name}, ${o.district}`:"your location",$=F(x,g,c,u?.verdict||"caution"),y=async n=>{const m=n||t.trim();if(!m)return;const k={id:Date.now().toString(),role:"user",content:m,timestamp:new Date};r(h=>[...h,k]),s(""),d(!0),await new Promise(h=>setTimeout(h,1200+Math.random()*800));const S=E(m,x,g,c,u),I={id:(Date.now()+1).toString(),role:"assistant",content:S,timestamp:new Date};r(h=>[...h,I]),d(!1)};return e.jsxs("div",{className:"min-h-screen bg-background flex flex-col",children:[e.jsx(A,{variant:"app"}),e.jsxs("main",{className:"flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-6",children:[e.jsxs("div",{className:"flex items-center gap-1.5 text-xs text-muted-foreground mb-4",children:[e.jsx(f,{to:"/",className:"hover:text-foreground transition-colors",children:e.jsx(D,{className:"h-3.5 w-3.5"})}),e.jsx(w,{className:"h-3 w-3"}),e.jsx(f,{to:"/dashboard",className:"hover:text-foreground transition-colors",children:"Dashboard"}),e.jsx(w,{className:"h-3 w-3"}),e.jsx("span",{className:"text-foreground font-medium",children:"AI Advisor"})]}),e.jsxs("div",{className:"mb-6",children:[e.jsxs("div",{className:"flex items-center gap-3 mb-2",children:[e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary",children:e.jsx(B,{className:"h-5 w-5"})}),e.jsxs("div",{children:[e.jsx("h1",{className:"text-xl font-bold text-foreground",children:"AI Business Advisor"}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:["Context-aware guidance for ",x," in ",g]})]})]}),e.jsx("p",{className:"text-[11px] text-muted-foreground/60 ml-13",children:"🤖 Responses are based on your assessment data. Always verify critical financial decisions."})]}),e.jsxs("div",{className:"flex-1 flex flex-col rounded-2xl border border-border bg-white overflow-hidden mb-4",children:[e.jsxs("div",{className:"flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-[400px] max-h-[60vh]",children:[a.length===0&&e.jsxs("div",{className:"text-center py-8",children:[e.jsx("div",{className:"inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3",children:e.jsx(b,{className:"h-7 w-7"})}),e.jsx("h3",{className:"text-base font-bold text-foreground mb-1",children:"Ask me anything about your business assessment"}),e.jsx("p",{className:"text-sm text-muted-foreground max-w-sm mx-auto",children:"I understand your location, business type, capital, market data and financial structure. Ask me to explain any part of the analysis."})]}),a.map(n=>e.jsxs("div",{className:v("flex gap-3",n.role==="user"?"justify-end":"justify-start"),children:[n.role==="assistant"&&e.jsx("div",{className:"flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0 mt-1",children:e.jsx(b,{className:"h-3.5 w-3.5"})}),e.jsx("div",{className:v("max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",n.role==="user"?"bg-primary text-primary-foreground rounded-br-md":"bg-muted text-foreground rounded-bl-md"),children:e.jsx("div",{className:"whitespace-pre-wrap",children:n.content})}),n.role==="user"&&e.jsx("div",{className:"flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0 mt-1",children:e.jsx(T,{className:"h-3.5 w-3.5"})})]},n.id)),i&&e.jsxs("div",{className:"flex gap-3",children:[e.jsx("div",{className:"flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0",children:e.jsx(b,{className:"h-3.5 w-3.5"})}),e.jsx("div",{className:"bg-muted rounded-2xl rounded-bl-md px-4 py-3",children:e.jsxs("div",{className:"flex gap-1",children:[e.jsx("div",{className:"h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce",style:{animationDelay:"0ms"}}),e.jsx("div",{className:"h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce",style:{animationDelay:"150ms"}}),e.jsx("div",{className:"h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce",style:{animationDelay:"300ms"}})]})})]}),e.jsx("div",{ref:j})]}),a.length===0&&e.jsxs("div",{className:"px-4 pb-3 border-t border-border/50 pt-3",children:[e.jsx("p",{className:"text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider",children:"Suggested Questions"}),e.jsx("div",{className:"flex flex-wrap gap-1.5",children:$.map((n,m)=>e.jsx("button",{onClick:()=>y(n),className:"rounded-full border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-colors",children:n},m))})]}),e.jsx("div",{className:"border-t border-border p-3 sm:p-4",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("input",{type:"text",value:t,onChange:n=>s(n.target.value),onKeyDown:n=>n.key==="Enter"&&!n.shiftKey&&y(),placeholder:"Ask about your business assessment...",className:"flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",disabled:i}),e.jsx("button",{onClick:()=>y(),disabled:!t.trim()||i,className:v("flex h-10 w-10 items-center justify-center rounded-xl transition-colors",t.trim()&&!i?"bg-primary text-primary-foreground hover:bg-primary/90":"bg-muted text-muted-foreground"),children:e.jsx(R,{className:"h-4 w-4"})})]})})]}),e.jsxs("div",{className:"flex justify-center gap-3 mb-8",children:[e.jsx(f,{to:"/dashboard",className:"inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors",children:"Back to Dashboard"}),e.jsxs(f,{to:"/what-if",className:"inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors",children:["Try What-If",e.jsx(L,{className:"h-4 w-4"})]})]})]}),e.jsx(M,{})]})}export{z as default};
