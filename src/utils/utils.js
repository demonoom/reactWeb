/**
 * Created by madapeng on 17-4-8.
 */
export function getLocalTime (nS) {
    return new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/, ' ');
}