import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Bot, Image as ImageIcon, Trash2, X, UploadCloud, Send, Loader2 } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { batchesApi, type BatchStep } from '../api/batchesApi';
import { useCreateBatchJob } from '../hooks/useBatches';
import { toast } from 'sonner';
import styles from './BatchForm.module.css';

interface InProgressStep {
  id: string; // local UI temp key
  type: 'image' | 'mail' | 'ai';
  // Step data state
  mailData?: { to: string; prompt: string };
  aiData?: { prompt: string };
  imageData?: { uploadedImageKey: string; previewUrl: string };
  isUploadingImage?: boolean;
}

export const BatchCreateForm: React.FC = () => {
  const [steps, setSteps] = useState<InProgressStep[]>([]);
  const [draggingStepId, setDraggingStepId] = useState<string | null>(null);
  const navigate = useNavigate();
  const createBatchMutation = useCreateBatchJob();

  // Types available to add (max 1 of each type)
  const existingTypes = steps.map((s) => s.type);
  const availableTypes: ('image' | 'mail' | 'ai')[] = (['image', 'mail', 'ai'] as const).filter(
    (t) => !existingTypes.includes(t)
  );

  const addStep = (type: 'image' | 'mail' | 'ai') => {
    if (steps.length >= 3) return;
    const newStep: InProgressStep = {
      id: crypto.randomUUID(),
      type,
      mailData: type === 'mail' ? { to: '', prompt: '' } : undefined,
      aiData: type === 'ai' ? { prompt: '' } : undefined,
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = async (stepId: string) => {
    const target = steps.find((s) => s.id === stepId);
    if (target?.type === 'image' && target.imageData?.uploadedImageKey) {
      try {
        await batchesApi.deleteBatchImage(target.imageData.uploadedImageKey);
      } catch {}
    }
    setSteps(steps.filter((s) => s.id !== stepId));
  };

  // Image Upload Handler
  const handleImageFileSelect = async (stepId: string, file: File) => {
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Invalid Image Format', { description: 'Select JPG, PNG, or WebP image.' });
      return;
    }

    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, isUploadingImage: true } : s))
    );

    try {
      const res = await batchesApi.uploadBatchImage(file);
      setSteps((prev) =>
        prev.map((s) =>
          s.id === stepId
            ? {
                ...s,
                isUploadingImage: false,
                imageData: { uploadedImageKey: res.key, previewUrl: res.url },
              }
            : s
        )
      );
      toast.success('Image Uploaded', { description: 'Batch image step ready.' });
    } catch (err: any) {
      setSteps((prev) =>
        prev.map((s) => (s.id === stepId ? { ...s, isUploadingImage: false } : s))
      );
      toast.error('Upload Failed', { description: err.message || 'Image upload error' });
    }
  };

  const handleRemoveUploadedImage = async (stepId: string, key: string) => {
    try {
      await batchesApi.deleteBatchImage(key);
      toast.info('Image Removed');
    } catch {}

    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, imageData: undefined } : s))
    );
  };

  // Step Data Updaters
  const updateMailData = (stepId: string, field: 'to' | 'prompt', val: string) => {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id !== stepId || s.type !== 'mail') return s;

        return {
          ...s,
          mailData: {
            to: s.mailData?.to ?? '',
            prompt: s.mailData?.prompt ?? '',
            [field]: val,
          },
        };
      })
    );
  };

  const updateAiData = (stepId: string, val: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, aiData: { prompt: val } } : s))
    );
  };

  // Validation Checks
  const isStepValid = (step: InProgressStep): boolean => {
    if (step.type === 'mail') {
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step.mailData?.to || '');
      return emailValid && (step.mailData?.prompt?.length || 0) >= 10;
    }
    if (step.type === 'ai') {
      return (step.aiData?.prompt?.length || 0) >= 10;
    }
    if (step.type === 'image') {
      return !!step.imageData?.uploadedImageKey;
    }
    return false;
  };

  const isFormValid =
    steps.length >= 2 && steps.length <= 3 && steps.every(isStepValid);

  // Submit Handler
  const handleSubmitBatch = async () => {
    if (!isFormValid) return;

    const payloadSteps: BatchStep[] = steps.map((s) => {
      if (s.type === 'mail') {
        return { type: 'mail', data: { to: s.mailData!.to, prompt: s.mailData!.prompt } };
      }
      if (s.type === 'ai') {
        return { type: 'ai', data: { prompt: s.aiData!.prompt } };
      }
      return { type: 'image', data: { uploadedImageKey: s.imageData!.uploadedImageKey } };
    });

    try {
      await createBatchMutation.mutateAsync({ steps: payloadSteps });
      navigate('/batches');
    } catch {}
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Build Chained Batch Flow</h2>
        <p className={styles.subtitle}>
          Configure 2 to 3 distinct services to run sequentially as a BullMQ flow chain
        </p>
      </div>

      {/* Configured Step Cards Accordion */}
      {steps.map((step, idx) => {
        const valid = isStepValid(step);
        return (
          <div key={step.id} className={styles.stepCard}>
            <div className={styles.stepCardHeader}>
              <div className={styles.stepTitleGroup}>
                <span className={styles.stepBadge}>{idx + 1}</span>
                <span className={styles.stepName}>{step.type} Service Step</span>
              </div>
              <button
                className={styles.removeStepBtn}
                onClick={() => removeStep(step.id)}
                title="Remove Step"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* MAIL STEP FORM */}
            {step.type === 'mail' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className={styles.field}>
                  <label className={styles.label}>Recipient Email</label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    className={styles.input}
                    value={step.mailData?.to || ''}
                    onChange={(e) => updateMailData(step.id, 'to', e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Email Prompt Brief (min 10 chars)</label>
                  <textarea
                    placeholder="Draft a quarterly status newsletter..."
                    className={styles.textarea}
                    value={step.mailData?.prompt || ''}
                    onChange={(e) => updateMailData(step.id, 'prompt', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* AI STEP FORM */}
            {step.type === 'ai' && (
              <div className={styles.field}>
                <label className={styles.label}>AI Generation Prompt (min 10 chars)</label>
                <textarea
                  placeholder="Analyze the batch output metrics and generate a executive summary..."
                  className={styles.textarea}
                  value={step.aiData?.prompt || ''}
                  onChange={(e) => updateAiData(step.id, e.target.value)}
                />
              </div>
            )}

            {/* IMAGE STEP FORM */}
            {step.type === 'image' && (
              <div>
                {step.imageData?.previewUrl ? (
                  <div className={styles.imageUploadCard}>
                    <img
                      src={step.imageData.previewUrl}
                      alt="Uploaded Batch Step"
                      className={styles.imagePreviewThumb}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        Image Ready for Batch Flow
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Key: {step.imageData.uploadedImageKey.substring(0, 18)}...
                      </span>
                    </div>
                    <button
                      className={styles.imageDeleteBtn}
                      onClick={() =>
                        handleRemoveUploadedImage(step.id, step.imageData!.uploadedImageKey)
                      }
                      title="Remove Image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className={styles.field}>
                    <label className={styles.label}>Upload Batch Step Image</label>
                    <div
                      style={{
                        border: draggingStepId === step.id ? '2px dashed var(--primary)' : '2px dashed var(--border-medium)',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--text-secondary)',
                        background: draggingStepId === step.id ? 'rgba(249, 115, 22, 0.04)' : 'transparent',
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => document.getElementById(`batchFile_${step.id}`)?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDraggingStepId(step.id);
                      }}
                      onDragLeave={() => setDraggingStepId((current) => (current === step.id ? null : current))}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDraggingStepId(null);
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          handleImageFileSelect(step.id, file);
                        }
                      }}
                    >
                      {step.isUploadingImage ? (
                        <Loader2 className="spinner" size={24} style={{ color: 'var(--primary)' }} />
                      ) : (
                        <UploadCloud size={28} style={{ color: 'var(--primary)' }} />
                      )}
                      <span>
                        {step.isUploadingImage
                          ? 'Uploading image...'
                          : draggingStepId === step.id
                            ? 'Drop image here'
                            : 'Click to select or drag & drop image file'}
                      </span>
                      <input
                        id={`batchFile_${step.id}`}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: 'none' }}
                        onChange={(e) =>
                          e.target.files?.[0] && handleImageFileSelect(step.id, e.target.files[0])
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ fontSize: '0.75rem', color: valid ? 'var(--status-completed-text)' : 'var(--text-muted)' }}>
              {valid ? '✓ Step configuration complete' : '• Pending required configuration data'}
            </div>
          </div>
        );
      })}

      {/* Add Step Builder Control */}
      {steps.length < 3 && availableTypes.length > 0 && (
        <div className={styles.addStepArea}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Add a service step to your workflow ({steps.length}/3 steps added)
          </div>

          <div className={styles.serviceOptions}>
            {availableTypes.includes('mail') && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Mail size={16} />}
                onClick={() => addStep('mail')}
              >
                + Add Email Step
              </Button>
            )}
            {availableTypes.includes('ai') && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Bot size={16} />}
                onClick={() => addStep('ai')}
              >
                + Add AI Step
              </Button>
            )}
            {availableTypes.includes('image') && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ImageIcon size={16} />}
                onClick={() => addStep('image')}
              >
                + Add Image Step
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Validation Status & Submit Bar */}
      <div className={styles.validationBar}>
        <div>
          <strong>Status:</strong>{' '}
          {steps.length < 2
            ? 'Minimum 2 steps required before submission.'
            : isFormValid
            ? 'Batch flow ready to dispatch.'
            : 'Please complete required fields for all added steps.'}
        </div>
        <Button
          variant="primary"
          size="lg"
          disabled={!isFormValid}
          isLoading={createBatchMutation.isPending}
          leftIcon={<Send size={18} />}
          onClick={handleSubmitBatch}
        >
          Submit Batch Flow
        </Button>
      </div>
    </div>
  );
};
