(()=>{var a={};a.id=74,a.ids=[74],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},8128:a=>{"use strict";a.exports=require("next/dist/server/runtime-reacts.external.js")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},27910:a=>{"use strict";a.exports=require("stream")},28354:a=>{"use strict";a.exports=require("util")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},30841:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>z,patchFetch:()=>y,routeModule:()=>u,serverHooks:()=>x,workAsyncStorage:()=>v,workUnitAsyncStorage:()=>w});var d=c(19225),e=c(84006),f=c(8317),g=c(99373),h=c(34775),i=c(24235),j=c(261),k=c(54365),l=c(90771),m=c(73461),n=c(67798),o=c(92280),p=c(62018),q=c(45696),r=c(47929),s=c(86439),t=c(37527);let u=new d.AppRouteRouteModule({definition:{kind:e.RouteKind.APP_ROUTE,page:"/api/approval/confirm/route",pathname:"/api/approval/confirm",filename:"route",bundlePath:"app/api/approval/confirm/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"E:\\Projetos JV\\Labtech.com.br\\labtech-catalogo\\src\\app\\api\\approval\\confirm\\route.ts",nextConfigOutput:"",userland:()=>c(56438),...{}}),{workAsyncStorage:v,workUnitAsyncStorage:w,serverHooks:x}=u;function y(){return(0,f.patchFetch)({workAsyncStorage:v,workUnitAsyncStorage:w})}async function z(a,b,c){c.requestMeta&&(0,g.setRequestMeta)(a,c.requestMeta),u.isDev&&(0,g.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let d="/api/approval/confirm/route";"/index"===d&&(d="/");let f=await u.prepare(a,b,{srcPage:d,multiZoneDraftMode:!1});if(!f)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:v,deploymentId:w,params:x,nextConfig:y,parsedUrl:z,isDraftMode:A,prerenderManifest:B,routerServerContext:C,isOnDemandRevalidate:D,revalidateOnlyGenerated:E,resolvedPathname:F,clientReferenceManifest:G,serverActionsManifest:H}=f,I=(0,j.normalizeAppPath)(d),J=!!(B.dynamicRoutes[I]||B.routes[F]),K=async()=>((null==C?void 0:C.render404)?await C.render404(a,b,z,!1):b.end("This page could not be found"),null);if(J&&!A){let a=!!B.routes[F],b=B.dynamicRoutes[I];if(b&&!1===b.fallback&&!a){if(y.adapterPath)return await K();throw new s.NoFallbackError}}let L=null;!J||u.isDev||A||(L="/index"===(L=F)?"/":L);let M=!0===u.isDev||!J,N=J&&!M;H&&G&&(0,i.setManifestsSingleton)({page:d,clientReferenceManifest:G,serverActionsManifest:H});let O=a.method||"GET",P=(0,h.getTracer)(),Q=P.getActiveScopeSpan(),R=!!(null==C?void 0:C.isWrappedByNextServer),S=!!(0,g.getRequestMeta)(a,"minimalMode"),T=(0,g.getRequestMeta)(a,"incrementalCache")||await u.getIncrementalCache(a,y,B,S);null==T||T.resetRequestCache(),globalThis.__incrementalCache=T;let U={params:x,previewProps:B.preview,renderOpts:{experimental:{authInterrupts:!!y.experimental.authInterrupts,useCacheTimeout:y.experimental.useCacheTimeout},cacheComponents:!!y.cacheComponents,validationLevel:y.experimental.instantInsights.validationLevel,supportsDynamicResponse:M,incrementalCache:T,hmrRefreshHash:(0,g.getRequestMeta)(a,"hmrRefreshHash"),cacheLifeProfiles:y.cacheLife,staticPageGenerationTimeout:y.staticPageGenerationTimeout,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d,e)=>u.onRequestError(a,b,d,e,C)},sharedContext:{buildId:v,deploymentId:w}},V=new k.NodeNextRequest(a),W=new k.NodeNextResponse(b),X=l.NextRequestAdapter.fromNodeNextRequest(V,(0,l.signalFromNodeResponse)(b)),Y=async({previousCacheEntry:e})=>{try{if(!S&&D&&E&&!e)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let d=await u.handle(X,U);a.fetchMetrics=U.renderOpts.fetchMetrics;let f=U.renderOpts.pendingWaitUntil;f&&c.waitUntil&&(c.waitUntil(f),f=void 0);let g=U.renderOpts.collectedTags;if(!J)return await (0,o.I)(V,W,d,f),null;{let a=await d.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(d.headers);g&&(b[r.NEXT_CACHE_TAGS_HEADER]=g),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==U.renderOpts.collectedRevalidate&&!(U.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&U.renderOpts.collectedRevalidate,e=void 0===U.renderOpts.collectedExpire||U.renderOpts.collectedExpire>=r.INFINITE_CACHE?!1!==c&&c>0?y.expireTime:void 0:U.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:d.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:e}}}}catch(b){throw(null==e?void 0:e.isStale)&&await u.onRequestError(a,b,{routerKind:"App Router",routePath:d,routeType:"route",revalidateReason:(0,n.getRevalidateReason)({isStaticGeneration:N,isOnDemandRevalidate:D})},!1,C),b}},Z=async(d,f)=>{try{var g,i;let d=await u.handleResponse({req:a,nextConfig:y,cacheKey:L,routeKind:e.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:B,isRoutePPREnabled:!1,isOnDemandRevalidate:D,revalidateOnlyGenerated:E,responseGenerator:Y,waitUntil:c.waitUntil,isMinimalMode:S});if(!J)return;if((null==d||null==(g=d.value)?void 0:g.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(i=d.value)?void 0:i.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});S||b.setHeader("x-nextjs-cache",D?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),A&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let f=(0,p.fromNodeOutgoingHttpHeaders)(d.value.headers);S&&J||f.delete(r.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||b.getHeader("Cache-Control")||f.get("Cache-Control")||f.set("Cache-Control",(0,q.getCacheControlHeader)(d.cacheControl)),await (0,o.I)(V,W,new Response(d.value.body,{headers:f,status:d.value.status||200}));return}catch(b){if(b instanceof s.NoFallbackError||await u.onRequestError(a,b,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,n.getRevalidateReason)({isStaticGeneration:N,isOnDemandRevalidate:D})},!1,C),J)throw b;await (0,o.I)(V,W,new Response(null,{status:500}));return}finally{(()=>{if(!d)return;let a=b.statusCode;d.setAttributes({"http.status_code":a,"next.rsc":!1}),a&&a>=500&&(d.setStatus({code:h.SpanStatusCode.ERROR}),d.setAttribute("error.type",a.toString()));let c=P.getRootSpanAttributes();if(!c)return;if(c.get("next.span_type")!==m.BaseServerSpan.handleRequest)return console.warn(`Unexpected root span type '${c.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=c.get("next.route")||I,g=`${O} ${e}`;d.setAttributes({"next.route":e,"http.route":e,"next.span_name":g}),d.updateName(g),f&&f!==d&&(f.setAttribute("http.route",e),f.updateName(g))})()}};if(R&&Q)await Z(Q,void 0);else{let b=P.getActiveScopeSpan();await P.withPropagatedContext(a.headers,()=>P.trace(m.BaseServerSpan.handleRequest,{spanName:`${O} ${d}`,kind:h.SpanKind.SERVER,attributes:{"http.method":O,"http.target":a.url}},a=>Z(a,b)),void 0,!R)}}},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:a=>{"use strict";a.exports=require("crypto")},56438:(a,b,c)=>{"use strict";c.r(b),c.d(b,{POST:()=>i});var d=c(23211),e=c(43151),f=c(68681);let g=c(55511);async function h(a){return g.createHash("sha256").update(a).digest("hex")}async function i(a){try{let b="https://labtechcatalogo.supabase.co",c=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!b||!c)return d.NextResponse.json({success:!1,error:"Configura\xe7\xe3o do servidor incompleta"},{status:500});let g=(0,e.UU)(b,c),{token:i,action:j,rejectReason:k}=await a.json();if(!i||!j)return d.NextResponse.json({success:!1,error:"Par\xe2metros inv\xe1lidos"},{status:400});if("approve"!==j&&"reject"!==j)return d.NextResponse.json({success:!1,error:"A\xe7\xe3o inv\xe1lida"},{status:400});let l=await h(i),{data:m,error:n}=await g.from("approval_tokens").select(`
        id,
        customer_id,
        action:action,
        used_at,
        expires_at
      `).eq("token_hash",l).single();if(n||!m)return d.NextResponse.json({success:!1,error:"Token n\xe3o encontrado"},{status:404});if(m.used_at)return d.NextResponse.json({success:!1,error:"Token j\xe1 utilizado"},{status:400});if(new Date(m.expires_at)<new Date)return d.NextResponse.json({success:!1,error:"Token expirado"},{status:400});if(m.action!==("approve"===j?"APPROVE":"REJECT"))return d.NextResponse.json({success:!1,error:"A\xe7\xe3o do token n\xe3o corresponde"},{status:400});let{data:o,error:p}=await g.from("customer_profiles").select("*").eq("id",m.customer_id).single();if(p||!o)return d.NextResponse.json({success:!1,error:"Cliente n\xe3o encontrado"},{status:404});let q="APPROVED"===o.status;if("approve"===j){let{error:a}=await g.from("customer_profiles").update({status:"APPROVED",approved_at:new Date().toISOString(),approval_method:"EMAIL",updated_at:new Date().toISOString()}).eq("id",o.id);if(a)return d.NextResponse.json({success:!1,error:"Erro ao aprovar cliente"},{status:500});if(!q)try{await (0,f._w)(o)}catch(a){console.error("Erro ao enviar e-mail de aprova\xe7\xe3o:",a)}}else{let{error:a}=await g.from("customer_profiles").update({status:"REJECTED",rejected_at:new Date().toISOString(),rejection_reason:k||null,approval_method:"EMAIL",updated_at:new Date().toISOString()}).eq("id",o.id);if(a)return d.NextResponse.json({success:!1,error:"Erro ao rechazar cliente"},{status:500});try{await (0,f.IE)(o,k)}catch(a){console.error("Erro ao enviar e-mail de rejei\xe7\xe3o:",a)}}return await g.from("approval_tokens").update({used_at:new Date().toISOString()}).eq("id",m.id),d.NextResponse.json({success:!0,message:"approve"===j?"Cliente aprovado com sucesso":"Cliente rejeitado com sucesso"})}catch(a){return console.error("Erro ao processar confirma\xe7\xe3o:",a),d.NextResponse.json({success:!1,error:"Erro interno do servidor"},{status:500})}}},57075:a=>{"use strict";a.exports=require("node:stream")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},68681:(a,b,c)=>{"use strict";c.d(b,{IE:()=>j,Mj:()=>h,_w:()=>i});var d=c(77483);let e=process.env.ADMIN_APPROVAL_EMAIL||"",f=process.env.EMAIL_FROM||"LABTECH <naoresponda@labtech.com.br>",g="http://localhost:3000";async function h(a,b){if(!e)return console.error("ADMIN_APPROVAL_EMAIL n\xe3o configurado"),{success:!1,error:"E-mail do respons\xe1vel n\xe3o configurado"};let c=new d.u(process.env.RESEND_API_KEY),h=`${g}/aprovacao?token=${b}&action=approve`,i=`${g}/aprovacao?token=${b}&action=reject`,j="CNPJ"===a.document_type?`${a.document.slice(0,2)}.${a.document.slice(2,5)}.${a.document.slice(5,8)}/${a.document.slice(8,12)}-${a.document.slice(12)}`:`${a.document.slice(0,3)}.${a.document.slice(3,6)}.${a.document.slice(6,9)}-${a.document.slice(9)}`,k=`(${a.phone.slice(0,2)}) ${a.phone.slice(2,7)}-${a.phone.slice(7)}`,l=`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Cliente Aguardando Aprova\xe7\xe3o | LABTECH</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F4FBFD;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F4FBFD; padding: 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px; text-align: center; background: linear-gradient(135deg, #087A9F 0%, #0796C4 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">LABTECH</h1>
              <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Cat\xe1logo Exclusivo</p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <h2 style="margin: 0; color: #102833; font-size: 22px; font-weight: 600;">Novo Cadastro Aguardando Aprova\xe7\xe3o</h2>
              <p style="margin: 10px 0 0 0; color: #102833; opacity: 0.7; font-size: 14px;">
                Um novo cliente solicitou acesso ao cat\xe1logo LABTECH.
              </p>
            </td>
          </tr>

          <!-- Data Section -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0;">
                <!-- Dados do Representante -->
                <tr>
                  <td colspan="2" style="padding: 15px 20px; border-bottom: 1px solid #E2E8F0;">
                    <strong style="color: #087A9F; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Dados do Representante</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; width: 40%; color: #64748B; font-size: 13px;">Nome do Representante:</td>
                  <td style="padding: 12px 20px; color: #102833; font-size: 14px; font-weight: 500;">${a.representative_name}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #64748B; font-size: 13px;">Cargo:</td>
                  <td style="padding: 12px 20px; color: #102833; font-size: 14px;">${a.position}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #64748B; font-size: 13px;">CPF/CNPJ:</td>
                  <td style="padding: 12px 20px; color: #102833; font-size: 14px;"><code style="background-color: #E2E8F0; padding: 2px 8px; border-radius: 4px; font-size: 13px;">${j}</code></td>
                </tr>

                <!-- Dados da Empresa -->
                <tr>
                  <td colspan="2" style="padding: 15px 20px; border-bottom: 1px solid #E2E8F0; border-top: 1px solid #E2E8F0;">
                    <strong style="color: #087A9F; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Dados da Empresa</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #64748B; font-size: 13px;">Empresa / Raz\xe3o Social:</td>
                  <td style="padding: 12px 20px; color: #102833; font-size: 14px; font-weight: 500;">${a.company_name}</td>
                </tr>

                <!-- Contato -->
                <tr>
                  <td colspan="2" style="padding: 15px 20px; border-bottom: 1px solid #E2E8F0; border-top: 1px solid #E2E8F0;">
                    <strong style="color: #087A9F; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Contato</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #64748B; font-size: 13px;">Telefone:</td>
                  <td style="padding: 12px 20px; color: #102833; font-size: 14px;">${k}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #64748B; font-size: 13px;">E-mail:</td>
                  <td style="padding: 12px 20px; color: #102833; font-size: 14px;">${a.email}</td>
                </tr>

                <!-- Endere\xe7o -->
                <tr>
                  <td colspan="2" style="padding: 15px 20px; border-bottom: 1px solid #E2E8F0; border-top: 1px solid #E2E8F0;">
                    <strong style="color: #087A9F; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Endere\xe7o</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #64748B; font-size: 13px;">CEP:</td>
                  <td style="padding: 12px 20px; color: #102833; font-size: 14px;">${a.postal_code}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #64748B; font-size: 13px;">Endere\xe7o:</td>
                  <td style="padding: 12px 20px; color: #102833; font-size: 14px;">${a.street}, ${a.number}${a.complement?` - ${a.complement}`:""}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #64748B; font-size: 13px;">Bairro:</td>
                  <td style="padding: 12px 20px; color: #102833; font-size: 14px;">${a.neighborhood}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #64748B; font-size: 13px;">Cidade/UF:</td>
                  <td style="padding: 12px 20px; color: #102833; font-size: 14px;">${a.city}/${a.state}</td>
                </tr>
                ${a.reference_point?`
                <tr>
                  <td style="padding: 12px 20px; color: #64748B; font-size: 13px;">Ponto de Refer\xeancia:</td>
                  <td style="padding: 12px 20px; color: #102833; font-size: 14px;">${a.reference_point}</td>
                </tr>
                `:""}

                <!-- Status -->
                <tr>
                  <td colspan="2" style="padding: 15px 20px; border-top: 1px solid #E2E8F0;">
                    <span style="background-color: #FEF3C7; color: #92400E; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                      AGUARDANDO APROVA\xc7\xc3O
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Buttons -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${h}" style="display: inline-block; padding: 14px 32px; background-color: #059669; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin-right: 10px;">
                      APROVAR CADASTRO
                    </a>
                    <a href="${i}" style="display: inline-block; padding: 14px 32px; background-color: #DC2626; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                      REJEITAR CADASTRO
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 15px; text-align: center;">
                    <p style="margin: 0; color: #64748B; font-size: 12px;">
                      Clique no bot\xe3o acima para realizar a a\xe7\xe3o diretamente.<br>
                      Ou copie e cole o link no navegador: ${h}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #F1F5F9; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #64748B; font-size: 12px;">
                Mensagem autom\xe1tica enviada pelo sistema LABTECH.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;try{return await c.emails.send({from:f,to:e,subject:"Novo cliente aguardando aprova\xe7\xe3o | LABTECH",html:l}),{success:!0}}catch(a){return console.error("Erro ao enviar e-mail de notifica\xe7\xe3o:",a),{success:!1,error:a.message}}}async function i(a){let b=new d.u(process.env.RESEND_API_KEY),c=`${g}/login`,e=`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cadastro Aprovado | LABTECH</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F4FBFD;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F4FBFD; padding: 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px; text-align: center; background: linear-gradient(135deg, #087A9F 0%, #0796C4 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">LABTECH</h1>
              <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Tecnologia para Laborat\xf3rios</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <!-- Success Icon -->
              <div style="width: 80px; height: 80px; background-color: #D1FAE5; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <svg style="width: 40px; height: 40px; color: #059669;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 style="margin: 0 0 10px 0; color: #102833; font-size: 24px; font-weight: 600;">
                Cadastro Aprovado!
              </h2>
              <p style="margin: 0 0 20px 0; color: #102833; opacity: 0.7; font-size: 16px;">
                Ol\xe1, ${a.representative_name.split(" ")[0]}!
              </p>
              <p style="margin: 0 0 30px 0; color: #102833; opacity: 0.7; font-size: 15px; line-height: 1.6;">
                Temos uma \xf3tima not\xedcia!<br>
                Seu cadastro na LABTECH foi analisado e aprovado com sucesso.
              </p>

              <!-- CTA Button -->
              <a href="${c}" style="display: inline-block; padding: 16px 40px; background-color: #087A9F; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                ACESSAR MINHA CONTA
              </a>

              <p style="margin: 30px 0 0 0; color: #64748B; font-size: 13px;">
                Utilize o e-mail e a senha informados no cadastro para acessar.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #F1F5F9; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #64748B; font-size: 12px;">
                Se precisar de suporte, nossa equipe est\xe1 \xe0 disposi\xe7\xe3o.
              </p>
              <p style="margin: 10px 0 0 0; color: #64748B; font-size: 11px;">
                \xa9 ${new Date().getFullYear()} LABTECH - Tecnologia, precis\xe3o e confian\xe7a.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;try{return await b.emails.send({from:f,to:a.email,subject:"Seu cadastro foi aprovado | LABTECH",html:e}),{success:!0}}catch(a){return console.error("Erro ao enviar e-mail de aprova\xe7\xe3o:",a),{success:!1,error:a.message}}}async function j(a,b){let c=new d.u(process.env.RESEND_API_KEY),e=`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cadastro Reprovado | LABTECH</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F4FBFD;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F4FBFD; padding: 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px; text-align: center; background: linear-gradient(135deg, #087A9F 0%, #0796C4 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">LABTECH</h1>
              <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Tecnologia para Laborat\xf3rios</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <!-- Info Icon -->
              <div style="width: 80px; height: 80px; background-color: #FEE2E2; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <svg style="width: 40px; height: 40px; color: #DC2626;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>

              <h2 style="margin: 0 0 10px 0; color: #102833; font-size: 24px; font-weight: 600;">
                Cadastro Reprovado
              </h2>
              <p style="margin: 0 0 20px 0; color: #102833; opacity: 0.7; font-size: 16px;">
                Ol\xe1, ${a.representative_name.split(" ")[0]}!
              </p>
              <p style="margin: 0 0 20px 0; color: #102833; opacity: 0.7; font-size: 15px; line-height: 1.6;">
                Infelizmente, seu cadastro na LABTECH n\xe3o foi aprovado neste momento.
                ${b?`<br><br><strong>Motivo:</strong> ${b}</p>`:""}
              </p>

              <p style="margin: 0; color: #64748B; font-size: 13px;">
                Para mais informa\xe7\xf5es, entre em contato com a equipe LABTECH.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #F1F5F9; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #64748B; font-size: 11px;">
                \xa9 ${new Date().getFullYear()} LABTECH - Tecnologia, precis\xe3o e confian\xe7a.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;try{return await c.emails.send({from:f,to:a.email,subject:"Status do seu cadastro | LABTECH",html:e}),{success:!0}}catch(a){return console.error("Erro ao enviar e-mail de rejei\xe7\xe3o:",a),{success:!1,error:a.message}}}},78335:()=>{},84297:a=>{"use strict";a.exports=require("async_hooks")},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},96487:()=>{}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[445,813,151,483],()=>b(b.s=30841));module.exports=c})();