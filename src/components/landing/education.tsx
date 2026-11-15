"use client";

import {
  certificationStatus,
  educationConfig,
  educationSectionConfig,
  type CertificationStatus,
} from "@/config/education";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

const statusStyles: Record<CertificationStatus["status"], string> = {
  Certified: "text-success",
  "In progress": "text-primary",
  Studying: "text-muted-foreground",
};

export function Education() {
  return (
    <section className="border-t border-dashed pt-6">
      <h2 className="section-heading mb-3">{educationSectionConfig.title}</h2>
      <div className="space-y-4 px-6">
        {educationConfig.map((item, idx) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
            className="border border-dashed p-4"
          >
            <h3 className="text-base font-semibold">{item.degree}</h3>
            <p className="text-sm text-muted-foreground">
              {item.school} · <span className="font-mono text-xs">{item.period}</span>
            </p>
            {item.note ? (
              <p className="mt-2 text-sm text-muted-foreground">{item.note}</p>
            ) : null}
          </motion.article>
        ))}

        {certificationStatus.length ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="border border-dashed"
          >
            <p className="border-b border-dashed px-4 py-2.5 font-mono text-xs tracking-wider text-muted-foreground">
              {educationSectionConfig.certificationsLabel}
            </p>
            <ul className="divide-y divide-dashed">
              {certificationStatus.map((cert) => (
                <li
                  key={cert.id}
                  className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm"
                >
                  <span>
                    {cert.title}
                    {cert.issuer ? (
                      <span className="text-muted-foreground"> — {cert.issuer}</span>
                    ) : null}
                  </span>
                  <span className={cn("shrink-0 font-mono text-xs", statusStyles[cert.status])}>
                    {cert.status}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
