(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[938],{6898:function(e,t,s){Promise.resolve().then(s.bind(s,3701))},3701:function(e,t,s){"use strict";s.r(t),s.d(t,{default:function(){return b}});var a=s(7437),n=s(2265),r=s(5153),l=s(4402),i=s(6070),c=s(2869),o=s(9205);let d=(0,o.Z)("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]),u=(0,o.Z)("Server",[["rect",{width:"20",height:"8",x:"2",y:"2",rx:"2",ry:"2",key:"ngkwjq"}],["rect",{width:"20",height:"8",x:"2",y:"14",rx:"2",ry:"2",key:"iecqi9"}],["line",{x1:"6",x2:"6.01",y1:"6",y2:"6",key:"16zg32"}],["line",{x1:"6",x2:"6.01",y1:"18",y2:"18",key:"nzw8ys"}]]);var x=s(2735),m=s(8930),f=s(1817),h=s(7648);function p(e){let{status:t}=e;switch(t){case"installed":return(0,a.jsx)("span",{className:"inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800",children:"Installed"});case"not installed":return(0,a.jsx)("span",{className:"inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800",children:"Not Installed"});case"installing":return(0,a.jsx)("span",{className:"inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800",children:"Installing"})}}function y(e){let{model:t,onDownload:s,onDelete:n}=e;return(0,a.jsx)(i.Zb,{className:"mb-4",children:(0,a.jsxs)(i.aY,{className:"flex justify-between items-center p-4",children:[(0,a.jsxs)("div",{className:"flex flex-col space-y-1",children:[(0,a.jsx)("h3",{className:"text-lg font-medium",children:t.model}),(0,a.jsxs)(h.default,{href:t.url,target:"_blank",rel:"noopener noreferrer",className:"text-sm text-blue-600 hover:text-blue-800 flex items-center",children:[(0,a.jsx)("span",{className:"truncate max-w-[200px]",children:t.url}),(0,a.jsx)(d,{className:"h-3 w-3 ml-1 flex-shrink-0"})]}),(0,a.jsx)("div",{className:"mt-1",children:(0,a.jsx)(p,{status:t.is_installed})})]}),(0,a.jsxs)("div",{className:"flex items-center space-x-4",children:[(0,a.jsx)(u,{className:"h-5 w-5 text-muted-foreground"}),"not installed"===t.is_installed&&(0,a.jsxs)(c.z,{size:"sm",onClick:()=>s(t.model),children:[(0,a.jsx)(x.Z,{className:"h-4 w-4 mr-2"}),"Install"]}),"installed"===t.is_installed&&(0,a.jsxs)(c.z,{size:"sm",variant:"destructive",onClick:()=>n(t.model),children:[(0,a.jsx)(m.Z,{className:"h-4 w-4 mr-2"}),"Delete"]}),"installing"===t.is_installed&&(0,a.jsxs)(c.z,{size:"sm",disabled:!0,children:[(0,a.jsx)(f.Z,{className:"h-4 w-4 mr-2 animate-spin"}),"Installing"]})]})]})})}var g=s(4508);function v(e){let{className:t,...s}=e;return(0,a.jsx)("div",{className:(0,g.cn)("animate-pulse rounded-md bg-primary/10",t),...s})}function w(){return(0,a.jsx)(i.Zb,{className:"mb-4",children:(0,a.jsxs)(i.aY,{className:"flex justify-between items-center p-4",children:[(0,a.jsxs)("div",{className:"flex flex-col space-y-2",children:[(0,a.jsx)(v,{className:"h-6 w-[150px]"}),(0,a.jsx)(v,{className:"h-4 w-[200px]"}),(0,a.jsx)(v,{className:"h-5 w-[100px]"})]}),(0,a.jsxs)("div",{className:"flex items-center space-x-4",children:[(0,a.jsx)(v,{className:"h-5 w-5 rounded-full"}),(0,a.jsx)(v,{className:"h-9 w-[100px]"})]})]})})}function b(){let[e,t]=(0,n.useState)([]),[s,i]=(0,n.useState)(!0),[c,o]=(0,n.useState)(null),{toast:d}=(0,r.pm)(),u=(0,n.useCallback)(async()=>{try{let e=await l.R.getModels();t(t=>(JSON.stringify(t)!==JSON.stringify(e)&&d({title:"Models Updated",description:"The status of one or more models has changed."}),e)),o(null)}catch(e){console.error("Failed to fetch models:",e),o("Failed to fetch models")}finally{i(!1)}},[d]);(0,n.useEffect)(()=>{u();let e=setInterval(u,5e3);return()=>clearInterval(e)},[u]);let x=async e=>{try{await l.R.downloadModel(e),d({title:"Success",description:"Model ".concat(e," download started.")}),u()}catch(t){d({title:"Error",description:"Failed to start download for model ".concat(e,". Please try again. Error: ").concat(t),variant:"destructive"})}},m=async e=>{try{await l.R.deleteModel(e),d({title:"Success",description:"Model ".concat(e," deleted successfully.")}),u()}catch(t){d({title:"Error",description:"Failed to delete model ".concat(e,". Please try again. Error: ").concat(t),variant:"destructive"})}};return c?(0,a.jsx)("div",{className:"flex justify-center items-center h-screen",children:(0,a.jsx)("p",{className:"text-red-500",children:c})}):(0,a.jsxs)("div",{className:"container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-3xl",children:[(0,a.jsx)("h1",{className:"text-3xl font-bold mb-8",children:"Available Models"}),(0,a.jsx)("div",{className:"space-y-4",children:s?[,,,,].fill(0).map((e,t)=>(0,a.jsx)(w,{},t)):e.map(e=>(0,a.jsx)(y,{model:e,onDownload:x,onDelete:m},e.model))})]})}},2869:function(e,t,s){"use strict";s.d(t,{z:function(){return o}});var a=s(7437),n=s(2265),r=s(7053),l=s(7712),i=s(4508);let c=(0,l.j)("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",{variants:{variant:{default:"bg-primary text-primary-foreground shadow hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",outline:"border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",secondary:"bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-9 px-4 py-2",sm:"h-8 rounded-md px-3 text-xs",lg:"h-10 rounded-md px-8",icon:"h-9 w-9"}},defaultVariants:{variant:"default",size:"default"}}),o=n.forwardRef((e,t)=>{let{className:s,variant:n,size:l,asChild:o=!1,...d}=e,u=o?r.g7:"button";return(0,a.jsx)(u,{className:(0,i.cn)(c({variant:n,size:l,className:s})),ref:t,...d})});o.displayName="Button"},6070:function(e,t,s){"use strict";s.d(t,{Zb:function(){return l},aY:function(){return i}});var a=s(7437),n=s(2265),r=s(4508);let l=n.forwardRef((e,t)=>{let{className:s,...n}=e;return(0,a.jsx)("div",{ref:t,className:(0,r.cn)("rounded-xl border bg-card text-card-foreground shadow",s),...n})});l.displayName="Card",n.forwardRef((e,t)=>{let{className:s,...n}=e;return(0,a.jsx)("div",{ref:t,className:(0,r.cn)("flex flex-col space-y-1.5 p-6",s),...n})}).displayName="CardHeader",n.forwardRef((e,t)=>{let{className:s,...n}=e;return(0,a.jsx)("h3",{ref:t,className:(0,r.cn)("font-semibold leading-none tracking-tight",s),...n})}).displayName="CardTitle",n.forwardRef((e,t)=>{let{className:s,...n}=e;return(0,a.jsx)("p",{ref:t,className:(0,r.cn)("text-sm text-muted-foreground",s),...n})}).displayName="CardDescription";let i=n.forwardRef((e,t)=>{let{className:s,...n}=e;return(0,a.jsx)("div",{ref:t,className:(0,r.cn)("p-6 pt-0",s),...n})});i.displayName="CardContent",n.forwardRef((e,t)=>{let{className:s,...n}=e;return(0,a.jsx)("div",{ref:t,className:(0,r.cn)("flex items-center p-6 pt-0",s),...n})}).displayName="CardFooter"},5153:function(e,t,s){"use strict";s.d(t,{pm:function(){return x}});var a=s(2265);let n=0,r=new Map,l=e=>{if(r.has(e))return;let t=setTimeout(()=>{r.delete(e),d({type:"REMOVE_TOAST",toastId:e})},1e6);r.set(e,t)},i=(e,t)=>{switch(t.type){case"ADD_TOAST":return{...e,toasts:[t.toast,...e.toasts].slice(0,1)};case"UPDATE_TOAST":return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case"DISMISS_TOAST":{let{toastId:s}=t;return s?l(s):e.toasts.forEach(e=>{l(e.id)}),{...e,toasts:e.toasts.map(e=>e.id===s||void 0===s?{...e,open:!1}:e)}}case"REMOVE_TOAST":if(void 0===t.toastId)return{...e,toasts:[]};return{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)}}},c=[],o={toasts:[]};function d(e){o=i(o,e),c.forEach(e=>{e(o)})}function u(e){let{...t}=e,s=(n=(n+1)%Number.MAX_SAFE_INTEGER).toString(),a=()=>d({type:"DISMISS_TOAST",toastId:s});return d({type:"ADD_TOAST",toast:{...t,id:s,open:!0,onOpenChange:e=>{e||a()}}}),{id:s,dismiss:a,update:e=>d({type:"UPDATE_TOAST",toast:{...e,id:s}})}}function x(){let[e,t]=a.useState(o);return a.useEffect(()=>(c.push(t),()=>{let e=c.indexOf(t);e>-1&&c.splice(e,1)}),[e]),{...e,toast:u,dismiss:e=>d({type:"DISMISS_TOAST",toastId:e})}}},4508:function(e,t,s){"use strict";s.d(t,{cn:function(){return r}});var a=s(1994),n=s(3335);function r(){for(var e=arguments.length,t=Array(e),s=0;s<e;s++)t[s]=arguments[s];return(0,n.m6)((0,a.W)(t))}},2735:function(e,t,s){"use strict";s.d(t,{Z:function(){return a}});let a=(0,s(9205).Z)("Download",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]])},8930:function(e,t,s){"use strict";s.d(t,{Z:function(){return a}});let a=(0,s(9205).Z)("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]])},4402:function(e,t,s){"use strict";s.d(t,{C:function(){return n},R:function(){return l}});var a=s(3464);let n="http://localhost:8000";class r{async getImages(){return(await this.axiosInstance.get("/images")).data.images}async checkHealth(){await this.axiosInstance.get("/health")}async getQueueStatus(){return(await this.axiosInstance.get("/queue")).data}async generateImage(e){let t="dev"===e.model?"/dev/generate":"/schnell/generate";await this.axiosInstance.post(t,e)}async generateBulkImages(e,t){await this.axiosInstance.post("dev"===t?"/dev/generate/bulk":"/schnell/generate/bulk",e)}async deleteImage(e){await this.axiosInstance.delete("/images/".concat(e))}async downloadImage(e){return(await this.axiosInstance.get("/images/download/".concat(e),{responseType:"blob"})).data}async downloadAllImages(){return(await this.axiosInstance.get("/images/download_all",{responseType:"blob"})).data}async deleteAllImages(){await this.axiosInstance.delete("/images/all")}async getModels(){return(await this.axiosInstance.get("/models")).data}async downloadModel(e){await this.axiosInstance.get("/models/".concat(e,"/download"))}async deleteModel(e){await this.axiosInstance.delete("/models/".concat(e))}constructor(){this.axiosInstance=a.Z.create({baseURL:n,timeout:1e4})}}let l=new r}},function(e){e.O(0,[140,648,971,117,744],function(){return e(e.s=6898)}),_N_E=e.O()}]);