export function getOfflineChapterContent(moduleId: string, chapterId: string, chapterTitle: string, moduleTitle: string): string {
  // A robust dynamic template for all 30 courses (120+ chapters)
  const isAdvanced = chapterTitle.toLowerCase().includes('advanced') || chapterTitle.toLowerCase().includes('deep') || chapterId.includes('4') || chapterId.includes('10');
  
  return `
# ${chapterTitle}

Welcome to this comprehensive study guide on **${chapterTitle}**, a core concept in the **${moduleTitle}** module. 

## 1. Overview and Core Concepts

The field of AI and Machine Learning relies heavily on robust theoretical foundations. When studying ${chapterTitle}, the primary objective is to understand how algorithms can map inputs to outputs effectively. 

> [!NOTE]
> **Key Takeaway:** Always ensure your data is clean and your objective function is well-defined before applying advanced techniques.

### Core Architecture
Here is a high-level representation of a typical pipeline used in this domain:

\`\`\`mermaid
graph TD
    A[Raw Data] --> B[Preprocessing]
    B --> C{Feature Extraction}
    C -->|Vectorization| D[Model Training]
    C -->|Normalization| D
    D --> E[Evaluation & Metrics]
    E --> F[Deployment / Inference]
\`\`\`

## 2. Mathematical Foundations

The mathematics underlying ${chapterTitle} often involve optimizing a loss function. A standard formulation used across many models is minimizing the empirical risk:

$$
\\mathcal{L}(\\theta) = \\frac{1}{N} \\sum_{i=1}^{N} \\ell(y_i, f_w(x_i)) + \\lambda \\Omega(\\theta)
$$

Where:
- $\\mathcal{L}(\\theta)$ is the total loss.
- $\\ell$ represents the individual loss (e.g., Cross-Entropy or Mean Squared Error).
- $\\Omega(\\theta)$ is the regularization term (e.g., $L2$ penalty) to prevent overfitting.

## 3. Practical Implementation

Understanding the theory is only half the battle. Below is a foundational implementation using Python and modern data science libraries (such as PyTorch or NumPy).

\`\`\`python
import numpy as np
import torch
import torch.nn as nn

class CoreModel(nn.Module):
    def __init__(self, input_dim, hidden_dim):
        super(CoreModel, self).__init__()
        # Defining the architecture for ${chapterTitle}
        self.network = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(p=0.3),
            nn.Linear(hidden_dim, 1)
        )
        
    def forward(self, x):
        \"\"\"
        Forward pass for the model.
        Args: x (Tensor)
        \"\"\"
        return self.network(x)

# Example Initialization
model = CoreModel(input_dim=128, hidden_dim=64)
print(f"Initialized model for ${moduleTitle}:\\n", model)
\`\`\`

## 4. Best Practices & Advanced Considerations

${isAdvanced ? "Since this is an advanced topic, you must consider the scalability and computational overhead of your approach. Distributed training and gradient accumulation are highly recommended." : "For basic concepts, focus on getting the fundamental math correct before worrying about massive scale or complex architectures."}

### Quick Checklist:
- [x] Verify data integrity and missing values.
- [x] Choose the correct evaluation metric (Accuracy, F1, ROC-AUC).
- [x] Monitor for overfitting using a validation split.
- [x] Log experiments using tools like MLflow or Weights & Biases.

`;
}

export function getOfflineFlashcards(chapterTitle: string, moduleTitle: string): { question: string, answer: string }[] {
  return [
    {
      question: `What is the primary objective when studying ${chapterTitle}?`,
      answer: `To understand how algorithms can map inputs to outputs effectively within the context of ${moduleTitle}.`
    },
    {
      question: `What is a key consideration before applying advanced techniques in ${chapterTitle}?`,
      answer: `Always ensure your data is clean and your objective function is well-defined.`
    },
    {
      question: `What does the mathematical loss function $\\mathcal{L}(\\theta)$ represent in this topic?`,
      answer: `It represents the total empirical risk or error that the model is trying to minimize during training.`
    },
    {
      question: `Why is the regularization term $\\Omega(\\theta)$ important?`,
      answer: `It adds a penalty (like L2) to the loss function to prevent the model from overfitting to the training data.`
    },
    {
      question: `What is the typical final step in the pipeline for ${chapterTitle} models?`,
      answer: `Deployment and Inference, where the trained model is used to make predictions on new, unseen data.`
    }
  ];
}