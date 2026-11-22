const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const {execFileSync}=require('node:child_process');
const script=execFileSync('ruby',['-ryaml','-e',"w=YAML.safe_load(File.read(ARGV[0]));print w.fetch('jobs').fetch('freshness').fetch('steps').first.fetch('with').fetch('script')",path.join(__dirname,'../.github/workflows/review-pull-requests.yml')],{encoding:'utf8'});
const sha='45a5be608b0e41359196ea1fb98cea838b7a29e3';
async function check({head='current',source=sha,job='success',review='current',pr=7,author='github-actions[bot]',state='COMMENTED',candidate='trusted',poll=false,draft=false,payloadDraft=draft,liveHead='current',submitted='2026-11-22T00:00:02Z'}={}) {
 let failed=false,passed=false,calls=0;
 const github={rest:{actions:{listWorkflowRunsForRepo:async()=>({data:{workflow_runs:poll && ++calls===1?[]:[{id:1,path:'.github/workflows/ready.yml',head_sha:head,status:'completed',referenced_workflows:[{path:`Amperative/review-workflows/.github/workflows/claude-review.yml@${source}`,sha:source}],pull_requests:[{number:pr}]}]}}),getWorkflowRun:async()=>({data:{referenced_workflows:[{path:`Amperative/review-workflows/.github/workflows/claude-review.yml@${source}`,sha:source}]}}),listJobsForWorkflowRun:'jobs'},pulls:{get:async()=>({data:{draft,head:{sha:liveHead},base:{sha:'base'}}}),listReviews:'reviews'},repos:{getContent:async args=>({data:{type:'file',sha:args.ref==='base'?'trusted':candidate}})}},paginate:async fn=>typeof fn==='function'?(await fn()).data.workflow_runs:fn==='jobs'?[{name:'review / Claude findings',conclusion:job,started_at:'2026-11-22T00:00:01Z',completed_at:'2026-11-22T00:00:03Z'}]:[{commit_id:review,user:{login:author},state,submitted_at:submitted,body:'Review findings'}]};
 let now=0;
 await new AsyncFunction('github','context','core','process','Date','setTimeout',script)(github,{repo:{owner:'Amperative',repo:'review-workflows'},payload:{action:poll?'ready_for_review':'synchronize',pull_request:{draft:payloadDraft,head:{sha:'current'},base:{sha:'base'},number:7}}},{info:()=>passed=true,setFailed:()=>failed=true},{env:{EXPECTED_REVIEW_REF:`Amperative/review-workflows/.github/workflows/claude-review.yml@${sha}`}},{now:()=>now,parse:Date.parse},resolve=>{now+=10000;resolve();});
 return {failed,passed};
}
test('accepts completed hardened-source review from unchanged base caller',async()=>assert.deepEqual(await check(),{failed:false,passed:true}));
test('rejects stale heads, untrusted source, skipped job, wrong PR, author/state and modified caller',async()=>{for(const fixture of [{head:'old'},{review:'old'},{source:'other'},{job:'skipped'},{pr:8},{author:'someone'},{state:'DISMISSED'},{candidate:'tampered'},{draft:true},{submitted:'2026-11-21T00:00:00Z'},{liveHead:'newer'}]) assert.deepEqual(await check(fixture),{failed:true,passed:false});});
test('ready check polls for newly completed evidence without invoking a model',async()=>assert.deepEqual(await check({poll:true}),{failed:false,passed:true}));

test('rerunning an original draft event reads current readiness without requesting a model',async()=>assert.deepEqual(await check({payloadDraft:true,draft:false}),{failed:false,passed:true}));
