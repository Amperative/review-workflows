const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const workflow=JSON.parse(execFileSync('ruby',['-rjson','-ryaml','-e','puts JSON.generate(YAML.safe_load(File.read(ARGV[0])))',path.join(__dirname,'../.github/workflows/refresh-review-freshness.yml')],{encoding:'utf8'}));
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const script=workflow.jobs.refresh.steps[0].with.script;
const expected='Amperative/review-workflows/.github/workflows/claude-review.yml@45a5be608b0e41359196ea1fb98cea838b7a29e3';
async function run({source=expected,head='head',current='head',fork=false,model='success',wrapper='failure',fakeId=false,wrongPr=false,eventName='workflow_run'}={}) {
 const writes=[];
 const completed={id:10,event:'pull_request',conclusion:'success',head_sha:head,head_repository:{full_name:fork?'other/repo':'Amperative/test'},referenced_workflows:[{path:source,sha:source.split('@').pop()}],pull_requests:[{number:1}]};
 const github={rest:{actions:{getWorkflowRun:async()=>({data:completed}),listJobsForWorkflowRun:'jobs',listWorkflowRunsForRepo:'runs'},pulls:{get:async()=>({data:{state:'open',draft:false,head:{sha:current}}})}},paginate:async(fn,args)=>fn==='runs'?[{id:20,workflow_id:fakeId?999:123,path:'.github/workflows/review-pull-requests.yml',head_sha:'head',pull_requests:[{number:wrongPr?2:1}],status:'completed',conclusion:wrapper}]:args.run_id===10?[{name:'review / Claude findings',conclusion:model}]:[{id:30,name:'Current commit reviewed',conclusion:'failure'},{id:31,name:'review / Claude findings',conclusion:'failure'}],request:async(route,args)=>writes.push({route,...args})};
 await new AsyncFunction('github','context','core','process',script)(github,{eventName,repo:{owner:'Amperative',repo:'test'},payload:{workflow_run:{...completed,head_sha:'head'}}},{info:()=>{},warning:()=>{},setFailed:message=>{throw new Error(message)}},{env:{FRESHNESS_WORKFLOW_ID:'123',EXPECTED_REVIEW_REF:expected}});
 return writes;
}
test('trusted completion refreshes only the failed read-only gate job',async()=>{
 const writes=await run();assert.equal(writes.length,1);assert.equal(writes[0].job_id,30);assert.equal(writes[0].route,'POST /repos/{owner}/{repo}/actions/jobs/{job_id}/rerun');
});
test('untrusted source, fork, stale head, skipped model and fake workflow ID cannot refresh jobs',async()=>{
 for(const opts of [{source:'other'},{fork:true},{current:'newer'},{model:'skipped'},{fakeId:true},{wrongPr:true},{wrapper:'success'}]) assert.deepEqual(await run(opts),[]);
});

test('privileged completion uses only the embedded reviewed script, with no checkout or provider permission',()=>{
 assert.deepEqual(workflow.permissions,{actions:'write','pull-requests':'read'});
 assert.equal(workflow.jobs.refresh.steps.length,1);
 assert.equal(workflow.jobs.refresh.steps[0].uses,'actions/github-script@ed597411d8f924073f98dfc5c65a23a2325f34cd');
 assert.equal(workflow.jobs.refresh.steps[0].with.script,script);
});

test('pull-request events cannot invoke the privileged completion path',async()=>assert.rejects(run({eventName:'pull_request'}),/requires workflow_run/));
