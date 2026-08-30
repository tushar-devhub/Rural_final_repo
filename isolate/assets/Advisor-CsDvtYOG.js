import{j as e}from"./framer-motion-DK4w1u5J.js";import{r as p,L as f}from"./react-vendor-iD-Vihsm.js";import{c as j,a as M}from"./index-D5Z-ubfU.js";import{N as T}from"./Navbar-CGL1v-_3.js";import{C as N,A as R,F as A}from"./Footer-CBp2aHZZ.js";import{c as b}from"./utils-C-WQBD2w.js";import{H as L}from"./house-BmAT_tiF.js";import{S as D}from"./sparkles-7RfZXRZ-.js";import"./radix-ui-C89142jh.js";import"./charts-DghROoNg.js";const B=[["path",{d:"M12 8V4H8",key:"hb8ula"}],["rect",{width:"16",height:"12",x:"4",y:"8",rx:"2",key:"enze0r"}],["path",{d:"M2 14h2",key:"vft8re"}],["path",{d:"M20 14h2",key:"4cs60a"}],["path",{d:"M15 13v2",key:"1xurst"}],["path",{d:"M9 13v2",key:"rq6x2g"}]],v=j("bot",B);const F=[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]],E=j("send",F);const W=[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]],H=j("user",W);function K(u,o,c,l){const a=[];return l==="good"?a.push("Why does this business show good potential?"):l==="caution"?a.push("What are the main risks I should watch out for?"):a.push("Should I consider a different business?"),a.push(`What if I invest ₹${Math.round(c*.5/1e3)}K instead of ₹${Math.round(c/1e3)}K?`,"Which customer groups should I target first?","Can I comfortably repay this loan?",`Why is competition important in ${o}?`),a}function q(u,o,c,l,a){const r=u.toLowerCase(),t=a;if(r.includes("why")&&r.includes("potential"))return`Based on the analysis for ${o} in ${c}:

Your business shows ${t?.verdict==="good"?"strong":"moderate"} potential because:

1. Market Reach: The area has approximately ${t?.marketReach.households?.toLocaleString("en-IN")||"4,200"} households within reach, providing a solid customer base.

2. Competition: With ${t?.competition.totalBusinesses||"18"} existing competitors, the density is ${t?.competition.density||"moderate"}. ${t?.competition.density==="low"?"This means less competition to worry about.":"You will need to differentiate your offering."}

3. Financial Structure: Your ₹${(l/1e3).toFixed(0)}K contribution through ${t?.financial.recommendedScheme||"the recommended scheme"} creates a manageable repayment structure.

Remember: This analysis is based on simulated market data for demonstration purposes.`;if(r.includes("risk")||r.includes("watch out")){const s=t?.risks||[];return s.length===0?"The analysis did not identify major risks for this scenario. However, every business carries inherent risks such as market changes, supply disruptions, and seasonal demand variations.":`Here are the key risks identified for ${o}:

${s.map((n,d)=>`${d+1}. ${n.name} (${n.severity.toUpperCase()}): ${n.explanation}
   Mitigation: ${n.mitigation}`).join(`

`)}

The overall risk score is ${t?.subScores?.riskScore||"N/A"}/100. ${t?.subScores?.riskScore&&t.subScores.riskScore>=70?"This is within acceptable range.":"This area deserves careful attention."}`}if(r.includes("invest")||r.includes("capital")||r.includes("₹")){const s=l*.5,n=s/.1;return`If you reduce your contribution to ₹${s.toLocaleString("en-IN")}:

• Project Cost would be: ₹${n.toLocaleString("en-IN")} (at 10% contribution)
• This falls within the ${n<=14e4?"Micro Finance scheme (max ₹1.25L)":"Term Loan scheme (max ₹45L)"}
• Your loan would be approximately ₹${(n*.9).toLocaleString("en-IN")}

⚠️ A lower contribution means a smaller initial setup. Consider whether this covers your essential equipment and inventory needs.

The financial engine can recalculate this for you with exact numbers.`}if(r.includes("customer")||r.includes("target")){const s=t?.marketReach.customerGroups||[];return`Based on the market analysis for ${c}:

Primary customer groups to target:
${s.map((n,d)=>`${d+1}. ${n}`).join(`
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

${s.rating==="comfortable"?"Your expected cash flow comfortably covers the loan repayment. This is a positive sign.":s.rating==="tight"?"The repayment is manageable but leaves limited margin. Careful cost control will be important.":"The repayment burden is high relative to expected revenue. Consider reducing the loan amount or exploring alternative financing."}`:"I cannot assess repayment comfort without financial data. Please run an assessment first."}if(r.includes("competition")||r.includes("competitor"))return`Competition analysis for ${o} in ${c}:

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
${s.length>0?s.map((n,d)=>`${d+1}. ${n}`).join(`
`):`1. Organic produce supply
2. Cold storage services
3. Digital payment services`}

The market gap analysis shows: ${t?.opportunity.underserved||"underserved categories exist in your area."}

You can use the What-If Simulator to compare different business options with the same location and capital.`}return`Based on your assessment of ${o} in ${c} with ₹${(l/1e3).toFixed(0)}K contribution:

The overall feasibility score is ${t?.overallScore||"N/A"}/100 with a verdict of "${t?.verdictLabel||"Analyzing"}".

${t?.decision?.summary||"The analysis covers market reach, competition, risks, financial structure and recommended next steps."}

Feel free to ask about specific aspects like:
• Market reach and customer groups
• Competition and pricing
• Financial structure and repayment
• Risks and mitigations
• Alternative business options`}function X(){const{feasibility:u,location:o,business:c,capital:l}=M(),[a,r]=p.useState([]),[t,s]=p.useState(""),[n,d]=p.useState(!1),w=p.useRef(null),$=()=>{w.current?.scrollIntoView({behavior:"smooth"})};p.useEffect(()=>{$()},[a]);const x=c?.name||"your business",y=o?`${o.name}, ${o.district}`:"your location",k=K(x,y,l,u?.verdict||"caution"),g=async i=>{const m=i||t.trim();if(!m)return;const S={id:Date.now().toString(),role:"user",content:m,timestamp:new Date};r(h=>[...h,S]),s(""),d(!0),await new Promise(h=>setTimeout(h,1200+Math.random()*800));const I=q(m,x,y,l,u),C={id:(Date.now()+1).toString(),role:"assistant",content:I,timestamp:new Date};r(h=>[...h,C]),d(!1)};return e.jsxs("div",{className:"min-h-screen bg-background flex flex-col",children:[e.jsx(T,{variant:"app"}),e.jsxs("main",{className:"flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-6",children:[e.jsxs("div",{className:"flex items-center gap-1.5 text-xs text-muted-foreground mb-4",children:[e.jsx(f,{to:"/",className:"hover:text-foreground transition-colors",children:e.jsx(L,{className:"h-3.5 w-3.5"})}),e.jsx(N,{className:"h-3 w-3"}),e.jsx(f,{to:"/dashboard",className:"hover:text-foreground transition-colors",children:"Dashboard"}),e.jsx(N,{className:"h-3 w-3"}),e.jsx("span",{className:"text-foreground font-medium",children:"AI Advisor"})]}),e.jsxs("div",{className:"mb-6",children:[e.jsxs("div",{className:"flex items-center gap-3 mb-2",children:[e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary",children:e.jsx(D,{className:"h-5 w-5"})}),e.jsxs("div",{children:[e.jsx("h1",{className:"text-xl font-bold text-foreground",children:"AI Business Advisor"}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:["Context-aware guidance for ",x," in ",y]})]})]}),e.jsx("p",{className:"text-[11px] text-muted-foreground/60 ml-13",children:"🤖 Responses are based on your assessment data. Always verify critical financial decisions."})]}),e.jsxs("div",{className:"flex-1 flex flex-col rounded-2xl border border-border bg-white overflow-hidden mb-4",children:[e.jsxs("div",{className:"flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-[400px] max-h-[60vh]",children:[a.length===0&&e.jsxs("div",{className:"text-center py-8",children:[e.jsx("div",{className:"inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3",children:e.jsx(v,{className:"h-7 w-7"})}),e.jsx("h3",{className:"text-base font-bold text-foreground mb-1",children:"Ask me anything about your business assessment"}),e.jsx("p",{className:"text-sm text-muted-foreground max-w-sm mx-auto",children:"I understand your location, business type, capital, market data and financial structure. Ask me to explain any part of the analysis."})]}),a.map(i=>e.jsxs("div",{className:b("flex gap-3",i.role==="user"?"justify-end":"justify-start"),children:[i.role==="assistant"&&e.jsx("div",{className:"flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0 mt-1",children:e.jsx(v,{className:"h-3.5 w-3.5"})}),e.jsx("div",{className:b("max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",i.role==="user"?"bg-primary text-primary-foreground rounded-br-md":"bg-muted text-foreground rounded-bl-md"),children:e.jsx("div",{className:"whitespace-pre-wrap",children:i.content})}),i.role==="user"&&e.jsx("div",{className:"flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0 mt-1",children:e.jsx(H,{className:"h-3.5 w-3.5"})})]},i.id)),n&&e.jsxs("div",{className:"flex gap-3",children:[e.jsx("div",{className:"flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0",children:e.jsx(v,{className:"h-3.5 w-3.5"})}),e.jsx("div",{className:"bg-muted rounded-2xl rounded-bl-md px-4 py-3",children:e.jsxs("div",{className:"flex gap-1",children:[e.jsx("div",{className:"h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce",style:{animationDelay:"0ms"}}),e.jsx("div",{className:"h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce",style:{animationDelay:"150ms"}}),e.jsx("div",{className:"h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce",style:{animationDelay:"300ms"}})]})})]}),e.jsx("div",{ref:w})]}),a.length===0&&e.jsxs("div",{className:"px-4 pb-3 border-t border-border/50 pt-3",children:[e.jsx("p",{className:"text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider",children:"Suggested Questions"}),e.jsx("div",{className:"flex flex-wrap gap-1.5",children:k.map((i,m)=>e.jsx("button",{onClick:()=>g(i),className:"rounded-full border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-colors",children:i},m))})]}),e.jsx("div",{className:"border-t border-border p-3 sm:p-4",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("input",{type:"text",value:t,onChange:i=>s(i.target.value),onKeyDown:i=>i.key==="Enter"&&!i.shiftKey&&g(),placeholder:"Ask about your business assessment...",className:"flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",disabled:n}),e.jsx("button",{onClick:()=>g(),disabled:!t.trim()||n,className:b("flex h-10 w-10 items-center justify-center rounded-xl transition-colors",t.trim()&&!n?"bg-primary text-primary-foreground hover:bg-primary/90":"bg-muted text-muted-foreground"),children:e.jsx(E,{className:"h-4 w-4"})})]})})]}),e.jsxs("div",{className:"flex justify-center gap-3 mb-8",children:[e.jsx(f,{to:"/dashboard",className:"inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors",children:"Back to Dashboard"}),e.jsxs(f,{to:"/what-if",className:"inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors",children:["Try What-If",e.jsx(R,{className:"h-4 w-4"})]})]})]}),e.jsx(A,{})]})}export{X as default};
