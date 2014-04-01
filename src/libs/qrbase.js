"use strict";var QRBase;function ReedSolomon(e){this.logger=null,this.n_ec_bytes=e,this.n_degree_max=2*e,this.syndroms=[],this.gen_poly=null,this.initGaloisTables()}ReedSolomon.prototype={encode:function(e){var t,n,r,i,s;this.gen_poly==null&&(this.gen_poly=this.genPoly(this.n_ec_bytes));t=new Array(this.n_ec_bytes+1);for(n=0;n<this.n_ec_bytes+1;n++)t[n]=0;for(n=0;n<e.length;n++){r=e[n]^t[this.n_ec_bytes-1];for(i=this.n_ec_bytes-1;i>0;i--)t[i]=t[i-1]^this.gmult(this.gen_poly[i],r);t[0]=this.gmult(this.gen_poly[0],r)}s=[];for(n=this.n_ec_bytes-1;n>=0;n--)s.push(t[n]);return s},decode:function(e){var t;this.bytes_in=e,this.bytes_out=e.slice();t=this.calculateSyndroms();return t>0?this.correctErrors():this.corrected=!0,this.bytes_out.slice(0,this.bytes_out.length-this.n_ec_bytes)},genPoly:function(e){var t,r,i,n=this.zeroPoly();n[0]=1;for(i=0;i<e;i++)t=this.zeroPoly(),t[0]=this.gexp[i],t[1]=1,r=this.multPolys(t,n),n=this.copyPoly(r);return this.logger&&this.logger.debug("RS genPoly: "+r.join(",")),r},calculateSyndroms:function(){var e,t,n,r;this.syndroms=[];t=0;for(r=0;r<this.n_ec_bytes;r++){e=0;for(n=0;n<this.bytes_in.length;n++)e=this.bytes_in[n]^this.gmult(this.gexp[r],e);this.syndroms.push(e),e>0&&t++}return this.logger&&(t>0?this.logger.debug("RS calculateSyndroms: <b>Errors found!</b> syndroms = "+this.syndroms.join(",")):this.logger.debug("RS calculateSyndroms: <b>No errors</b>")),t},correctErrors:function(){var e,t,n,r,i,s,o;this.berlekampMassey(),this.findRoots(),this.corrected=!1;if(2*this.n_errors>this.n_ec_bytes){this.uncorrected_reason="too many errors",this.logger&&this.logger.debug("RS correctErrors: <b>"+this.uncorrected_reason+"</b>");return}for(e=0;e<this.n_errors;e++)if(this.error_locs[e]>=this.bytes_in.length){this.uncorrected_reason="corrections out of scope",this.logger&&this.logger.debug("RS correctErrors: <b>"+this.uncorrected_reason+"</b>");return}if(this.n_errors===0){this.uncorrected_reason="could not identify errors",this.logger&&this.logger.debug("RS correctErrors: <b>"+this.uncorrected_reason+"</b>");return}for(t=0;t<this.n_errors;t++){n=this.error_locs[t],r=0;for(i=0;i<this.n_degree_max;i++)r^=this.gmult(this.omega[i],this.gexp[(255-n)*i%255]);s=0;for(i=0;i<this.n_degree_max;i+=2)s^=this.gmult(this.psi[i],this.gexp[(255-n)*i%255]);o=this.gmult(r,this.ginv(s));this.logger&&this.logger.debug("RS correctErrors: loc="+(this.bytes_out.length-n-1)+"  err = 0x0"+o.toString(16)+" = bin "+o.toString(2)),this.bytes_out[this.bytes_out.length-n-1]^=o}this.corrected=!0},berlekampMassey:function(){var t,n,r,i,s,o,u,a,f,e=this.zeroPoly();e[0]=1;t=this.copyPoly(e);this.mulZPoly(t),this.psi=this.copyPoly(e);n=new Array(this.n_degree_max),r=-1,i=0;for(o=0;o<this.n_ec_bytes;o++){u=this.computeDiscrepancy(this.psi,this.syndroms,i,o);if(u!==0){for(s=0;s<this.n_degree_max;s++)n[s]=this.psi[s]^this.gmult(u,t[s]);if(i<o-r){a=o-r;r=o-i;for(s=0;s<this.n_degree_max;s++)t[s]=this.gmult(this.psi[s],this.ginv(u));i=a}this.psi=this.copyPoly(n)}this.mulZPoly(t)}this.logger&&this.logger.debug("RS berlekampMassey: psi = "+this.psi.join(","));f=this.multPolys(this.psi,this.syndroms);this.omega=this.zeroPoly();for(s=0;s<this.n_ec_bytes;s++)this.omega[s]=f[s];this.logger&&this.logger.debug("RS berlekampMassey: omega = "+this.omega.join(","))},findRoots:function(){var e,t,n;this.n_errors=0,this.error_locs=[];for(t=1;t<256;t++){e=0;for(n=0;n<this.n_ec_bytes+1;n++)e^=this.gmult(this.gexp[n*t%255],this.psi[n]);e===0&&(this.error_locs.push(255-t),this.n_errors++)}this.logger&&this.logger.debug("RS findRoots: errors=<b>"+this.n_errors+"</b> locations = "+this.error_locs.join(","))},computeDiscrepancy:function(e,t,n,r){var s,i=0;for(s=0;s<=n;s++)i^=this.gmult(e[s],t[r-s]);return i},copyPoly:function(e){var n,t=new Array(this.n_degree_max);for(n=0;n<this.n_degree_max;n++)t[n]=e[n];return t},zeroPoly:function(){var t,e=new Array(this.n_degree_max);for(t=0;t<this.n_degree_max;t++)e[t]=0;return e},mulZPoly:function(e){var t;for(t=this.n_degree_max-1;t>0;t--)e[t]=e[t-1];e[0]=0},multPolys:function(e,t){var i,s,n=new Array(this.n_degree_max),r=new Array(this.n_degree_max*2);for(i=0;i<this.n_degree_max*2;i++)n[i]=0;for(i=0;i<this.n_degree_max;i++){for(s=this.n_degree_max;s<this.n_degree_max*2;s++)r[s]=0;for(s=0;s<this.n_degree_max;s++)r[s]=this.gmult(t[s],e[i]);for(s=this.n_degree_max*2-1;s>=i;s--)r[s]=r[s-i];for(s=0;s<i;s++)r[s]=0;for(s=0;s<this.n_degree_max*2;s++)n[s]^=r[s]}return n},initGaloisTables:function(){var f,l,e=0,t=1,n=0,r=0,i=0,s=0,o=0,u=0,a=0;this.gexp=new Array(512),this.glog=new Array(256),this.gexp[0]=1,this.gexp[255]=this.gexp[0],this.glog[0]=0;for(f=1;f<256;f++)e=a,a=u,u=o,o=s,s=i^e,i=r^e,r=n^e,n=t,t=e,this.gexp[f]=t+n*2+r*4+i*8+s*16+o*32+u*64+a*128,this.gexp[f+255]=this.gexp[f];for(f=1;f<256;f++){for(l=0;l<256;l++)if(this.gexp[l]===f){this.glog[f]=l;break}}},gmult:function(e,t){var n,r;if(e===0||t===0)return 0;n=this.glog[e],r=this.glog[t];return this.gexp[n+r]},ginv:function(e){return this.gexp[255-this.glog[e]]}},"use strict";QRBase={MODE:{Numeric:1,AlphaNumeric:2,EightBit:4,Terminator:0},ERROR_CORRECTION_LEVEL:{L:1,M:0,Q:3,H:2},errorThrow:function(e){if(!this._isError){if(!this._errorThrow)throw e;this._errorThrow(e),this._isError=!0}},setBlocks:function(e){var t=this.nCodewords[e.version],n=this.nECCodewords[e.version][e.ECLevel],r=this.ECBlocks[e.version][e.ECLevel],i,s,o,u,a,f,l,c=0;e.nDataCodewords=t-n,r.length===1?(s=r[0],o=0,i=s,u=e.nDataCodewords/i,a=0):(s=r[0],o=r[1],i=s+o,u=Math.floor(e.nDataCodewords/i),a=u+1),e.nBlockEcWords=n/i,e.blockDataLengths=[];for(l=0;l<s;l++)e.blockDataLengths[l]=u;for(l=s;l<i;l++)e.blockDataLengths[l]=a;e.blockIndices=[];for(l=0;l<i;l++)e.blockIndices[l]=[];for(f=0;f<u;f++)for(l=0;l<i;l++)e.blockIndices[l].push(c),c++;for(l=s;l<i;l++)e.blockIndices[l].push(c),c++;for(f=0;f<e.nBlockEcWords;f++)for(l=0;l<i;l++)e.blockIndices[l].push(c),c++},setFunctionalPattern:function(e){function t(e,t,n,r,i){var s,o;for(s=t;s<t+r;s++)for(o=n;o<n+i;o++)e.functionalPattern[s][o]=!0}function n(e,n){var r=n.alignmentPatterns[e.version].length,i,s;for(i=0;i<r;i++)for(s=0;s<r;s++){if(i===0&&s===0||i===0&&s===r-1||i===r-1&&s===0)continue;t(e,n.alignmentPatterns[e.version][i]-2,n.alignmentPatterns[e.version][s]-2,5,5)}}e.functionalPattern=[];var r,i;for(r=0;r<e.nModules;r++){e.functionalPattern[r]=[];for(i=0;i<e.nModules;i++)e.functionalPattern[r][i]=!1}t(e,0,0,9,9),t(e,e.nModules-8,0,8,9),t(e,0,e.nModules-8,9,8),t(e,8,6,e.nModules-8-8,1),t(e,6,8,1,e.nModules-8-8),n(e,this),e.version>=7&&(t(e,0,e.nModules-11,6,3),t(e,e.nModules-11,0,3,6))},nCountBits:function(e,t){if(e===this.MODE.EightBit)return t<10?8:16;if(e===this.MODE.AlphaNumeric)return t<10?9:t<27?11:13;if(e===this.MODE.Numeric)return t<10?10:t<27?12:14;this.errorThrow("Internal error: Unknown mode: "+e)},nModulesFromVersion:function(e){return 17+4*e},unicodeToUtf8:function(e){var t="",n=e.length,r,i;for(r=0;r<n;r++)i=e.charCodeAt(r),i>=1&&i<=127?t+=e.charAt(r):i>2047?(t+=String.fromCharCode(224|i>>12&15),t+=String.fromCharCode(128|i>>6&63),t+=String.fromCharCode(128|i>>0&63)):(t+=String.fromCharCode(192|i>>6&31),t+=String.fromCharCode(128|i>>0&63));return t},utf8Tounicode:function(e){var t="",n=e.length,r=0,i,s,o,u;while(r<n)s=e.charCodeAt(r++),i=s>>4,i<=7?t+=e.charAt(r-1):i===12||i===13?(o=e.charCodeAt(r++),t+=String.fromCharCode((s&31)<<6|o&63)):i===14&&(o=e.charCodeAt(r++),u=e.charCodeAt(r++),t+=String.fromCharCode((s&15)<<12|(o&63)<<6|(u&63)<<0));return t},setErrorThrow:function(e){typeof e=="function"&&(this._errorThrow=e)},alignmentPatterns:[null,[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],versionInfo:[null,null,null,null,null,null,null,31892,34236,39577,42195,48118,51042,55367,58893,63784,68472,70749,76311,79154,84390,87683,92361,96236,102084,102881,110507,110734,117786,119615,126325,127568,133589,136944,141498,145311,150283,152622,158308,161089,167017],formatInfo:[21522,20773,24188,23371,17913,16590,20375,19104,30660,29427,32170,30877,26159,25368,27713,26998,5769,5054,7399,6608,1890,597,3340,2107,13663,12392,16177,14854,9396,8579,11994,11245],nCodewords:[0,26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706],nECCodewords:[null,[10,7,17,13],[16,10,28,22],[26,15,44,36],[36,20,64,52],[48,26,88,72],[64,36,112,96],[72,40,130,108],[88,48,156,132],[110,60,192,160],[130,72,224,192],[150,80,264,224],[176,96,308,260],[198,104,352,288],[216,120,384,320],[240,132,432,360],[280,144,480,408],[308,168,532,448],[338,180,588,504],[364,196,650,546],[416,224,700,600],[442,224,750,644],[476,252,816,690],[504,270,900,750],[560,300,960,810],[588,312,1050,870],[644,336,1110,952],[700,360,1200,1020],[728,390,1260,1050],[784,420,1350,1140],[812,450,1440,1200],[868,480,1530,1290],[924,510,1620,1350],[980,540,1710,1440],[1036,570,1800,1530],[1064,570,1890,1590],[1120,600,1980,1680],[1204,630,2100,1770],[1260,660,2220,1860],[1316,720,2310,1950],[1372,750,2430,2040]],ECBlocks:[[],[[1],[1],[1],[1]],[[1],[1],[1],[1]],[[1],[1],[2],[2]],[[2],[1],[4],[2]],[[2],[1],[2,2],[2,2]],[[4],[2],[4],[4]],[[4],[2],[4,1],[2,4]],[[2,2],[2],[4,2],[4,2]],[[3,2],[2],[4,4],[4,4]],[[4,1],[2,2],[6,2],[6,2]],[[1,4],[4],[3,8],[4,4]],[[6,2],[2,2],[7,4],[4,6]],[[8,1],[4],[12,4],[8,4]],[[4,5],[3,1],[11,5],[11,5]],[[5,5],[5,1],[11,7],[5,7]],[[7,3],[5,1],[3,13],[15,2]],[[10,1],[1,5],[2,17],[1,15]],[[9,4],[5,1],[2,19],[17,1]],[[3,11],[3,4],[9,16],[17,4]],[[3,13],[3,5],[15,10],[15,5]],[[17],[4,4],[19,6],[17,6]],[[17],[2,7],[34],[7,16]],[[4,14],[4,5],[16,14],[11,14]],[[6,14],[6,4],[30,2],[11,16]],[[8,13],[8,4],[22,13],[7,22]],[[19,4],[10,2],[33,4],[28,6]],[[22,3],[8,4],[12,28],[8,26]],[[3,23],[3,10],[11,31],[4,31]],[[21,7],[7,7],[19,26],[1,37]],[[19,10],[5,10],[23,25],[15,25]],[[2,29],[13,3],[23,28],[42,1]],[[10,23],[17],[19,35],[10,35]],[[14,21],[17,1],[11,46],[29,19]],[[14,23],[13,6],[59,1],[44,7]],[[12,26],[12,7],[22,41],[39,14]],[[6,34],[6,14],[2,64],[46,10]],[[29,14],[17,4],[24,46],[49,10]],[[13,32],[4,18],[42,32],[48,14]],[[40,7],[20,4],[10,67],[43,22]],[[18,31],[19,6],[20,61],[34,34]]]}