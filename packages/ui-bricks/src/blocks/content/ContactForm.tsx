"use client";
import { useState } from "react";
import ScrollAnimation from "../../components/ui/scroll-animation";
import { AnimationTheme } from "../../lib/animation-config";
import styles from "./ContactForm.module.css";
import { Send, Loader2, CheckCircle } from "lucide-react";

interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
    placeholder?: string;
    required?: boolean;
    options?: string[];
}

interface ContactFormProps {
    title?: string;
    subtitle?: string;
    fields?: FormField[];
    submitText?: string;
    successMessage?: string;
    webhookUrl?: string;
    layout?: 'stacked' | 'side-by-side';
    backgroundColor?: string;
    titleColor?: string;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    animationStyle?: AnimationTheme;
}

export const ContactForm = ({
    title = "Contact Us",
    subtitle,
    fields = [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'message', label: 'Message', type: 'textarea', required: true }
    ],
    submitText = "Send Message",
    successMessage = "Thank you! We'll be in touch soon.",
    webhookUrl,
    layout = 'stacked',
    backgroundColor,
    titleColor,
    textColor,
    buttonColor,
    buttonTextColor,
    animationStyle = "simple"
}: ContactFormProps) => {
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (webhookUrl) {
            try {
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } catch (error) {
                console.error('Form submission error:', error);
            }
        }

        setLoading(false);
        setSubmitted(true);
    };

    const updateField = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <section
            className={styles.section}
            style={{ '--form-bg': backgroundColor || 'var(--color-background)' } as React.CSSProperties}
        >
            <div className={styles.container}>
                {(title || subtitle) && (
                    <ScrollAnimation theme={animationStyle}>
                        <div className={styles.header}>
                            {title && (
                                <h2 className={styles.title} style={{ color: titleColor || 'var(--color-text)' }}>
                                    {title}
                                </h2>
                            )}
                            {subtitle && (
                                <p className={styles.subtitle} style={{ color: textColor || 'var(--color-text-muted)' }}>
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </ScrollAnimation>
                )}

                <ScrollAnimation theme={animationStyle}>
                    {submitted ? (
                        <div className={styles.success}>
                            <CheckCircle className={styles.successIcon} style={{ color: buttonColor || 'var(--color-primary)' }} />
                            <p style={{ color: textColor || 'var(--color-text)' }}>{successMessage}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={`${styles.form} ${styles[layout]}`}>
                            {fields.map((field) => (
                                <div key={field.name} className={styles.field}>
                                    <label className={styles.label} style={{ color: textColor || 'var(--color-text)' }}>
                                        {field.label}
                                        {field.required && <span className={styles.required}>*</span>}
                                    </label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            name={field.name}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            value={formData[field.name] || ''}
                                            onChange={(e) => updateField(field.name, e.target.value)}
                                            className={styles.textarea}
                                        />
                                    ) : field.type === 'select' ? (
                                        <select
                                            name={field.name}
                                            required={field.required}
                                            value={formData[field.name] || ''}
                                            onChange={(e) => updateField(field.name, e.target.value)}
                                            className={styles.input}
                                        >
                                            <option value="">Select...</option>
                                            {field.options?.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type={field.type}
                                            name={field.name}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            value={formData[field.name] || ''}
                                            onChange={(e) => updateField(field.name, e.target.value)}
                                            className={styles.input}
                                        />
                                    )}
                                </div>
                            ))}

                            <button
                                type="submit"
                                disabled={loading}
                                className={styles.submit}
                                style={{
                                    backgroundColor: buttonColor || 'var(--color-primary)',
                                    color: buttonTextColor || '#fff'
                                }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className={styles.spinner} />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        {submitText}
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </ScrollAnimation>
            </div>
        </section>
    );
};
