import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Mail, Bot, Image as ImageIcon, UploadCloud, X, Send } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { useCreateEmailJob, useCreateAiJob, useCreateImageJob } from '../hooks/useJobs';
import { toast } from 'sonner';
import styles from './JobForm.module.css';

type JobType = 'email' | 'ai' | 'image';

// Validation Schemas
const emailJobSchema = z.object({
  to: z.string().email('Valid recipient email required'),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  priority: z.coerce.number().refine((val) => [1, 5, 10].includes(val), 'Select priority'),
});

const aiJobSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  priority: z.coerce.number().refine((val) => [1, 5, 10].includes(val), 'Select priority'),
});

export const SingleJobCreateForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<JobType>('email');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [imagePriority, setImagePriority] = useState<number>(5);
  const [isDragOver, setIsDragOver] = useState(false);

  const navigate = useNavigate();
  const createEmailMutation = useCreateEmailJob();
  const createAiMutation = useCreateAiJob();
  const createImageMutation = useCreateImageJob();

  // Email Form
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm({
    resolver: zodResolver(emailJobSchema),
    defaultValues: { to: '', prompt: '', priority: 5 },
  });

  // AI Form
  const {
    register: registerAi,
    handleSubmit: handleSubmitAi,
    formState: { errors: aiErrors },
  } = useForm({
    resolver: zodResolver(aiJobSchema),
    defaultValues: { prompt: '', priority: 5 },
  });

  // Handlers
  const onEmailSubmit = async (data: any) => {
    try {
      await createEmailMutation.mutateAsync({
        to: data.to,
        prompt: data.prompt,
        priority: Number(data.priority),
        idempotency_key: crypto.randomUUID(),
      });
      navigate('/jobs');
    } catch {}
  };

  const onAiSubmit = async (data: any) => {
    try {
      await createAiMutation.mutateAsync({
        prompt: data.prompt,
        priority: Number(data.priority),
        idempotency_key: crypto.randomUUID(),
      });
      navigate('/jobs');
    } catch {}
  };

  const handleFileSelect = (file: File) => {
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Invalid File Type', { description: 'Please select a JPEG, PNG, or WebP image.' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File Too Large', { description: 'Image size must be 10MB or less.' });
      return;
    }
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const onImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Image Required', { description: 'Please select an image file to upload.' });
      return;
    }

    try {
      await createImageMutation.mutateAsync({
        imageFile: selectedFile,
        priority: imagePriority,
        idempotency_key: crypto.randomUUID(),
      });
      navigate('/jobs');
    } catch {}
  };

  return (
    <div className={styles.container}>
      {/* Service Type Tab Bar */}
      <div className={styles.typeTabs}>
        <button
          className={`${styles.typeTab} ${activeTab === 'email' ? styles.typeTabActive : ''}`}
          onClick={() => setActiveTab('email')}
        >
          <Mail size={18} />
          <span>Email Job</span>
        </button>
        <button
          className={`${styles.typeTab} ${activeTab === 'ai' ? styles.typeTabActive : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          <Bot size={18} />
          <span>AI Response</span>
        </button>
        <button
          className={`${styles.typeTab} ${activeTab === 'image' ? styles.typeTabActive : ''}`}
          onClick={() => setActiveTab('image')}
        >
          <ImageIcon size={18} />
          <span>Image Processing</span>
        </button>
      </div>

      {/* Form Content */}
      <div className={styles.formCard}>
        {/* EMAIL JOB FORM */}
        {activeTab === 'email' && (
          <form onSubmit={handleSubmitEmail(onEmailSubmit)} className={styles.container}>
            <div className={styles.formHeader}>
              <h3 className={styles.formTitle}>Draft & Send AI Email Job</h3>
              <p className={styles.formSubtitle}>
                A 2-stage pipeline: AI generates custom email HTML from your prompt, then queues for dispatch.
              </p>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Recipient Email Address</label>
              <input
                type="email"
                placeholder="recipient@example.com"
                className={styles.input}
                {...registerEmail('to')}
              />
              {emailErrors.to && <span className={styles.errorMessage}>{emailErrors.to.message}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Prompt / Email Brief</label>
              <textarea
                placeholder="Write a welcome email offering a 20% discount code to new subscribers..."
                className={styles.textarea}
                {...registerEmail('prompt')}
              />
              {emailErrors.prompt && <span className={styles.errorMessage}>{emailErrors.prompt.message}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Priority</label>
              <select className={styles.select} {...registerEmail('priority')}>
                <option value={1}>Urgent</option>
                <option value={5}>High</option>
                <option value={10}>Normal</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={createEmailMutation.isPending}
              leftIcon={<Send size={18} />}
            >
              Queue Email Job
            </Button>
          </form>
        )}

        {/* AI JOB FORM */}
        {activeTab === 'ai' && (
          <form onSubmit={handleSubmitAi(onAiSubmit)} className={styles.container}>
            <div className={styles.formHeader}>
              <h3 className={styles.formTitle}>Standalone AI Response Job</h3>
              <p className={styles.formSubtitle}>Generate text responses via background LLM worker pipeline.</p>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Generation Prompt</label>
              <textarea
                placeholder="Summarize the core architectural benefits of BullMQ flow chains in Node.js..."
                className={styles.textarea}
                {...registerAi('prompt')}
              />
              {aiErrors.prompt && <span className={styles.errorMessage}>{aiErrors.prompt.message}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Priority</label>
              <select className={styles.select} {...registerAi('priority')}>
                <option value={1}>Urgent</option>
                <option value={5}>High</option>
                <option value={10}>Normal</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={createAiMutation.isPending}
              leftIcon={<Bot size={18} />}
            >
              Queue AI Job
            </Button>
          </form>
        )}

        {/* IMAGE PROCESSING FORM */}
        {activeTab === 'image' && (
          <form onSubmit={onImageSubmit} className={styles.container}>
            <div className={styles.formHeader}>
              <h3 className={styles.formTitle}>Image Optimization Job</h3>
              <p className={styles.formSubtitle}>
                Resize image to fit 1920×1920 bounds and re-encode to high-efficiency WebP format.
              </p>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Upload Image (JPEG, PNG, WebP ≤ 10MB)</label>
              {filePreview ? (
                <div className={styles.imagePreviewWrapper}>
                  <img src={filePreview} alt="Selected preview" className={styles.imagePreview} />
                  <button
                    type="button"
                    className={styles.removeImageBtn}
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                    title="Remove Image"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  className={`${styles.dropzone} ${isDragOver ? styles.dropzoneActive : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('imageFileInput')?.click()}
                >
                  <UploadCloud size={36} style={{ color: 'var(--primary)' }} />
                  <div>
                    <strong>Drag and drop image file here</strong> or click to browse
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Supports JPG, PNG, WebP up to 10MB
                  </span>
                  <input
                    id="imageFileInput"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  />
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Priority</label>
              <select
                className={styles.select}
                value={imagePriority}
                onChange={(e) => setImagePriority(Number(e.target.value))}
              >
                <option value={1}>Urgent</option>
                <option value={5}>High</option>
                <option value={10}>Normal</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={createImageMutation.isPending}
              leftIcon={<ImageIcon size={18} />}
            >
              Queue Image Job
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
