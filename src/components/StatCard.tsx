// Summary number card

import type { ReactNode } from "react";

// props are like the arguments of the react components
// every piece of data a component needs comes in through props.

type StatCardProps = {
    icon : ReactNode; // ReactNode means anything react can render - JSX, string, null
    title: string;
    value: string;
    subtitle: string;
};

/*
Destrcutuing props: insetad of using props then props.icon, props.title, props.value... 
you unpack them directly in the function signature. Same thing, cleaner syntax
*/
export default function StatCard({ icon, title, value, subtitle}: StatCardProps){
    return (
        <div className="stat-card">
            <div className="stat-card-icon">{icon}</div>
            <div className="stat-card-body">
                <span className="stat-card-title">{title}</span>
                <strong className="stat-card-value">{value}</strong>
                <p className="stat-card-subtitle">{subtitle}</p>
            </div>
        </div>
    );
}