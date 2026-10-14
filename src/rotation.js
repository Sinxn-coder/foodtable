import { MEALS } from "./roster.js";
export const TZ = "Asia/Kolkata";
export const START = Date.UTC(2026, 9, 5);
export function parts(date = new Date()) { return Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", hourCycle:"h23" }).formatToParts(date).filter(x=>x.type!=="literal").map(x=>[x.type,Number(x.value)])); }
export function rotationDay(date = new Date()) { const x=parts(date); const utc=Date.UTC(x.year,x.month-1,x.day); return (Math.floor((utc-START)/86400000)%14+14)%14+1; }
export function localDate(dayOffset=0, date=new Date()) { const x=parts(date); return new Date(Date.UTC(x.year,x.month-1,x.day+dayOffset)); }
export function mealDate(dayOffset, minutes, now=new Date()) { const d=localDate(dayOffset,now); return new Date(d.getTime()+minutes*60000-330*60000); }
export function liveInfo(now=new Date()) { const x=parts(now), day=rotationDay(now), minute=x.hour*60+x.minute; let mealIndex=MEALS.findIndex(m=>minute<m.minutes), offset=0; if(mealIndex<0){mealIndex=0;offset=1} return {day:((day-1+offset)%14)+1,mealIndex,offset, nextAt:mealDate(offset,MEALS[mealIndex].minutes,now)}; }
export function formatCountdown(ms) { const total=Math.max(0,Math.floor(ms/60000)), h=Math.floor(total/60), m=total%60; return h?`${h}h ${String(m).padStart(2,"0")}m`:`${m}m`; }
