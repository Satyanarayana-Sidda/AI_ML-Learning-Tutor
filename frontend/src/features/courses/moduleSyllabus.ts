export interface Chapter {
  id: string;
  title: string;
  level: "Basic" | "Intermediate" | "Advanced";
}

export interface ModuleSyllabus {
  id: string;
  title: string;
  icon: string;
  color: string;
  chapters: Chapter[];
}

export const SYLLABUS_DATA: Record<string, ModuleSyllabus> = {
  dsa: {
    id: "dsa",
    title: "Data Structures & Algorithms",
    icon: "Network",
    color: "from-accent-orange to-accent-peach",
    chapters: [
      { id: "dsa-1", title: "Introduction to Big-O Notation", level: "Basic" },
      { id: "dsa-2", title: "Arrays & Strings", level: "Basic" },
      { id: "dsa-3", title: "Linked Lists", level: "Basic" },
      { id: "dsa-4", title: "Stacks & Queues", level: "Basic" },
      { id: "dsa-5", title: "Hash Tables & Hash Maps", level: "Intermediate" },
      { id: "dsa-6", title: "Trees (Binary, BST, AVL)", level: "Intermediate" },
      { id: "dsa-7", title: "Heaps & Priority Queues", level: "Intermediate" },
      { id: "dsa-8", title: "Graphs (BFS, DFS)", level: "Advanced" },
      { id: "dsa-9", title: "Advanced Graph Algorithms (Dijkstra, A*)", level: "Advanced" },
      { id: "dsa-10", title: "Dynamic Programming (Memoization)", level: "Advanced" },
      { id: "dsa-11", title: "Tries & Prefix Trees", level: "Advanced" },
    ]
  },
  ml: {
    id: "ml",
    title: "Machine Learning Foundations",
    icon: "BrainCircuit",
    color: "from-accent-orange to-accent-peach",
    chapters: [
      { id: "ml-1", title: "Introduction to Machine Learning", level: "Basic" },
      { id: "ml-2", title: "Supervised vs Unsupervised Learning", level: "Basic" },
      { id: "ml-3", title: "Linear Regression & Gradient Descent", level: "Basic" },
      { id: "ml-4", title: "Logistic Regression & Classification", level: "Basic" },
      { id: "ml-5", title: "Decision Trees & Random Forests", level: "Intermediate" },
      { id: "ml-6", title: "Support Vector Machines (SVM)", level: "Intermediate" },
      { id: "ml-7", title: "K-Means Clustering & PCA", level: "Intermediate" },
      { id: "ml-8", title: "Cross-Validation & Hyperparameter Tuning", level: "Intermediate" },
      { id: "ml-9", title: "Ensemble Methods (XGBoost, LightGBM)", level: "Advanced" },
      { id: "ml-10", title: "Handling Imbalanced Datasets", level: "Advanced" },
      { id: "ml-11", title: "Feature Engineering Techniques", level: "Advanced" },
      { id: "ml-12", title: "Model Evaluation & ROC/AUC", level: "Advanced" },
    ]
  },
  dl: {
    id: "dl",
    title: "Deep Learning with PyTorch",
    icon: "Network",
    color: "from-accent-blue to-accent-peach",
    chapters: [
      { id: "dl-1", title: "Introduction to Neural Networks", level: "Basic" },
      { id: "dl-2", title: "Perceptrons & Activation Functions", level: "Basic" },
      { id: "dl-3", title: "Forward & Backpropagation", level: "Basic" },
      { id: "dl-4", title: "Getting Started with PyTorch Tensors", level: "Basic" },
      { id: "dl-5", title: "Building your first PyTorch Model", level: "Intermediate" },
      { id: "dl-6", title: "Optimizers (Adam, SGD, RMSprop)", level: "Intermediate" },
      { id: "dl-7", title: "Loss Functions & Regularization (Dropout)", level: "Intermediate" },
      { id: "dl-8", title: "Custom Datasets & DataLoaders", level: "Intermediate" },
      { id: "dl-9", title: "Transfer Learning & Fine-tuning", level: "Advanced" },
      { id: "dl-10", title: "Saving, Loading, and Checkpointing", level: "Advanced" },
      { id: "dl-11", title: "Distributed Data Parallel (DDP)", level: "Advanced" },
      { id: "dl-12", title: "TorchScript & Production Deployment", level: "Advanced" },
    ]
  },
  nlp: {
    id: "nlp",
    title: "NLP & Large Language Models",
    icon: "MessageSquare",
    color: "from-accent-orange to-accent-brown",
    chapters: [
      { id: "nlp-1", title: "What is Natural Language Processing?", level: "Basic" },
      { id: "nlp-2", title: "Text Preprocessing & Tokenization", level: "Basic" },
      { id: "nlp-3", title: "Bag of Words & TF-IDF", level: "Basic" },
      { id: "nlp-4", title: "Word Embeddings (Word2Vec, GloVe)", level: "Basic" },
      { id: "nlp-5", title: "Recurrent Neural Networks (RNNs)", level: "Intermediate" },
      { id: "nlp-6", title: "LSTMs & GRUs for Sequence Modeling", level: "Intermediate" },
      { id: "nlp-7", title: "Sequence-to-Sequence & Attention", level: "Intermediate" },
      { id: "nlp-8", title: "The Transformer Architecture", level: "Advanced" },
      { id: "nlp-9", title: "BERT and Masked Language Modeling", level: "Advanced" },
      { id: "nlp-10", title: "GPT and Causal Language Modeling", level: "Advanced" },
      { id: "nlp-11", title: "Prompt Engineering & Few-Shot Learning", level: "Advanced" },
      { id: "nlp-12", title: "Fine-tuning LLMs with LoRA/QLoRA", level: "Advanced" },
    ]
  },
  cv: {
    id: "cv",
    title: "Computer Vision Systems",
    icon: "Eye",
    color: "from-accent-brown to-accent-orange",
    chapters: [
      { id: "cv-1", title: "Introduction to Computer Vision", level: "Basic" },
      { id: "cv-2", title: "Image Representation & Color Spaces", level: "Basic" },
      { id: "cv-3", title: "Filters, Edges, and Convolutions", level: "Basic" },
      { id: "cv-4", title: "Introduction to CNNs", level: "Basic" },
      { id: "cv-5", title: "Pooling & Strided Convolutions", level: "Intermediate" },
      { id: "cv-6", title: "Classic Architectures (ResNet, VGG)", level: "Intermediate" },
      { id: "cv-7", title: "Data Augmentation for Images", level: "Intermediate" },
      { id: "cv-8", title: "Object Detection (YOLO, Faster R-CNN)", level: "Advanced" },
      { id: "cv-9", title: "Image Segmentation (U-Net, Mask R-CNN)", level: "Advanced" },
      { id: "cv-10", title: "Generative Adversarial Networks (GANs)", level: "Advanced" },
      { id: "cv-11", title: "Vision Transformers (ViT)", level: "Advanced" },
      { id: "cv-12", title: "Real-time Video Processing", level: "Advanced" },
    ]
  },
  rl: {
    id: "rl",
    title: "Reinforcement Learning",
    icon: "Code2",
    color: "from-accent-blue to-accent-brown",
    chapters: [
      { id: "rl-1", title: "What is Reinforcement Learning?", level: "Basic" },
      { id: "rl-2", title: "Agents, Environments, and States", level: "Basic" },
      { id: "rl-3", title: "Rewards and Returns", level: "Basic" },
      { id: "rl-4", title: "Markov Decision Processes (MDPs)", level: "Basic" },
      { id: "rl-5", title: "Dynamic Programming (Value Iteration)", level: "Intermediate" },
      { id: "rl-6", title: "Monte Carlo Methods", level: "Intermediate" },
      { id: "rl-7", title: "Temporal Difference Learning", level: "Intermediate" },
      { id: "rl-8", title: "Q-Learning Algorithm", level: "Intermediate" },
      { id: "rl-9", title: "Deep Q-Networks (DQN)", level: "Advanced" },
      { id: "rl-10", title: "Policy Gradient Methods", level: "Advanced" },
      { id: "rl-11", title: "Proximal Policy Optimization (PPO)", level: "Advanced" },
      { id: "rl-12", title: "Multi-Agent Reinforcement Learning", level: "Advanced" },
    ]
  },
  mlops: {
    id: "mlops",
    title: "MLOps & Model Deployment",
    icon: "Database",
    color: "from-accent-peach to-accent-orange",
    chapters: [
      { id: "mlops-1", title: "Introduction to MLOps", level: "Basic" },
      { id: "mlops-2", title: "The Machine Learning Lifecycle", level: "Basic" },
      { id: "mlops-3", title: "Version Control for Data and Code", level: "Basic" },
      { id: "mlops-4", title: "Containerization with Docker", level: "Basic" },
      { id: "mlops-5", title: "Model Tracking with MLflow", level: "Intermediate" },
      { id: "mlops-6", title: "Building APIs with FastAPI", level: "Intermediate" },
      { id: "mlops-7", title: "CI/CD Pipelines for ML", level: "Intermediate" },
      { id: "mlops-8", title: "Automated Testing for ML Models", level: "Intermediate" },
      { id: "mlops-9", title: "Cloud Deployment (AWS/GCP)", level: "Advanced" },
      { id: "mlops-10", title: "Kubernetes for ML Scaling", level: "Advanced" },
      { id: "mlops-11", title: "Model Monitoring & Data Drift", level: "Advanced" },
      { id: "mlops-12", title: "A/B Testing & Shadow Deployments", level: "Advanced" },
    ]
  },
  genai: {
    id: "genai",
    title: "Generative AI & Diffusion",
    icon: "Sparkles",
    color: "from-accent-orange to-accent-peach",
    chapters: [
      { id: "genai-1", title: "Introduction to Generative Models", level: "Basic" },
      { id: "genai-2", title: "Autoencoders & Variational Autoencoders", level: "Intermediate" },
      { id: "genai-3", title: "Diffusion Models Theory", level: "Advanced" },
      { id: "genai-4", title: "Building Stable Diffusion Apps", level: "Advanced" },
    ]
  },
  timeseries: {
    id: "timeseries",
    title: "Time Series Forecasting",
    icon: "LineChart",
    color: "from-accent-blue to-accent-peach",
    chapters: [
      { id: "ts-1", title: "Introduction to Time Series", level: "Basic" },
      { id: "ts-2", title: "ARIMA & Statistical Models", level: "Intermediate" },
      { id: "ts-3", title: "LSTMs for Time Series", level: "Advanced" },
      { id: "ts-4", title: "Transformer-based Forecasting", level: "Advanced" },
    ]
  },
  gnn: {
    id: "gnn",
    title: "Graph Neural Networks",
    icon: "Network",
    color: "from-accent-brown to-accent-orange",
    chapters: [
      { id: "gnn-1", title: "Introduction to Graph Theory", level: "Basic" },
      { id: "gnn-2", title: "Message Passing and GCNs", level: "Intermediate" },
      { id: "gnn-3", title: "Graph Attention Networks (GAT)", level: "Advanced" },
      { id: "gnn-4", title: "Applications of GNNs", level: "Advanced" },
    ]
  },
  ethics: {
    id: "ethics",
    title: "AI Ethics & Alignment",
    icon: "HeartHandshake",
    color: "from-accent-blue to-accent-brown",
    chapters: [
      { id: "eth-1", title: "Introduction to AI Ethics", level: "Basic" },
      { id: "eth-2", title: "Bias and Fairness in ML", level: "Intermediate" },
      { id: "eth-3", title: "Explainable AI (XAI)", level: "Advanced" },
      { id: "eth-4", title: "AI Safety and Alignment", level: "Advanced" },
    ]
  },
  nlg: {
    id: "nlg",
    title: "Natural Language Generation",
    icon: "FileText",
    color: "from-accent-orange to-accent-peach",
    chapters: [
      { id: "nlg-1", title: "Introduction to NLG", level: "Basic" },
      { id: "nlg-2", title: "Text Summarization", level: "Intermediate" },
      { id: "nlg-3", title: "Dialogue Systems & Chatbots", level: "Advanced" },
      { id: "nlg-4", title: "Advanced Text Generation", level: "Advanced" },
    ]
  },
  audio: {
    id: "audio",
    title: "Speech & Audio Processing",
    icon: "Mic",
    color: "from-accent-blue to-accent-peach",
    chapters: [
      { id: "audio-1", title: "Audio Data Fundamentals", level: "Basic" },
      { id: "audio-2", title: "Speech Recognition (ASR)", level: "Intermediate" },
      { id: "audio-3", title: "Text-to-Speech (TTS)", level: "Advanced" },
      { id: "audio-4", title: "Music & Audio Generation", level: "Advanced" },
    ]
  },
  robotics: {
    id: "robotics",
    title: "Autonomous Agents",
    icon: "Cpu",
    color: "from-accent-brown to-accent-orange",
    chapters: [
      { id: "rob-1", title: "Agent-based Modeling", level: "Basic" },
      { id: "rob-2", title: "Path Planning & Navigation", level: "Intermediate" },
      { id: "rob-3", title: "Sim-to-Real Transfer", level: "Advanced" },
      { id: "rob-4", title: "LLMs as Autonomous Agents", level: "Advanced" },
    ]
  },
  recsys: {
    id: "recsys",
    title: "Recommender Systems",
    icon: "ThumbsUp",
    color: "from-accent-blue to-accent-brown",
    chapters: [
      { id: "rec-1", title: "Collaborative Filtering", level: "Basic" },
      { id: "rec-2", title: "Content-Based Filtering", level: "Intermediate" },
      { id: "rec-3", title: "Matrix Factorization", level: "Advanced" },
      { id: "rec-4", title: "Deep Learning for RecSys", level: "Advanced" },
    ]
  },
  edge: {
    id: "edge",
    title: "Edge AI & TinyML",
    icon: "Smartphone",
    color: "from-accent-peach to-accent-orange",
    chapters: [
      { id: "edge-1", title: "Introduction to Edge AI", level: "Basic" },
      { id: "edge-2", title: "Model Quantization", level: "Intermediate" },
      { id: "edge-3", title: "Model Pruning & Distillation", level: "Advanced" },
      { id: "edge-4", title: "Deploying to Microcontrollers", level: "Advanced" },
    ]
  },
  prompting: {
    id: "prompting",
    title: "Prompt Engineering Mastery",
    icon: "Terminal",
    color: "from-accent-orange to-accent-brown",
    chapters: [
      { id: "prmpt-1", title: "Basics of Prompting", level: "Basic" },
      { id: "prmpt-2", title: "Chain-of-Thought Reasoning", level: "Intermediate" },
      { id: "prmpt-3", title: "Tree-of-Thoughts & React", level: "Advanced" },
      { id: "prmpt-4", title: "Prompt Optimization", level: "Advanced" },
    ]
  },
  math: {
    id: "math",
    title: "Mathematics for ML",
    icon: "Calculator",
    color: "from-accent-orange to-accent-brown",
    chapters: [
      { id: "math-1", title: "Linear Algebra Essentials", level: "Basic" },
      { id: "math-2", title: "Calculus & Gradients", level: "Intermediate" },
      { id: "math-3", title: "Matrix Decompositions (SVD)", level: "Advanced" },
      { id: "math-4", title: "Information Theory", level: "Advanced" },
    ]
  },
  stats: {
    id: "stats",
    title: "Probability & Statistics",
    icon: "PieChart",
    color: "from-accent-blue to-accent-peach",
    chapters: [
      { id: "stat-1", title: "Probability Distributions", level: "Basic" },
      { id: "stat-2", title: "Hypothesis Testing", level: "Intermediate" },
      { id: "stat-3", title: "Bayesian Inference", level: "Advanced" },
      { id: "stat-4", title: "Markov Chains", level: "Advanced" },
    ]
  },
  dataeng: {
    id: "dataeng",
    title: "Data Engineering for ML",
    icon: "Database",
    color: "from-accent-peach to-accent-orange",
    chapters: [
      { id: "de-1", title: "ETL Pipelines", level: "Basic" },
      { id: "de-2", title: "Data Warehousing", level: "Intermediate" },
      { id: "de-3", title: "Streaming with Kafka", level: "Advanced" },
      { id: "de-4", title: "Feature Stores", level: "Advanced" },
    ]
  },
  dataviz: {
    id: "dataviz",
    title: "Data Visualization",
    icon: "BarChart",
    color: "from-accent-brown to-accent-orange",
    chapters: [
      { id: "dv-1", title: "Principles of Dataviz", level: "Basic" },
      { id: "dv-2", title: "Matplotlib & Seaborn", level: "Intermediate" },
      { id: "dv-3", title: "Interactive Dashboards", level: "Advanced" },
      { id: "dv-4", title: "D3.js for Custom Visuals", level: "Advanced" },
    ]
  },
  bigdata: {
    id: "bigdata",
    title: "Big Data Analytics",
    icon: "Server",
    color: "from-accent-blue to-accent-brown",
    chapters: [
      { id: "bd-1", title: "Hadoop Ecosystem", level: "Basic" },
      { id: "bd-2", title: "Apache Spark RDDs", level: "Intermediate" },
      { id: "bd-3", title: "Spark SQL & DataFrames", level: "Advanced" },
      { id: "bd-4", title: "Distributed Machine Learning", level: "Advanced" },
    ]
  },
  automl: {
    id: "automl",
    title: "AutoML & NAS",
    icon: "Cpu",
    color: "from-accent-orange to-accent-peach",
    chapters: [
      { id: "aml-1", title: "Intro to AutoML", level: "Basic" },
      { id: "aml-2", title: "Hyperparameter Optimization", level: "Intermediate" },
      { id: "aml-3", title: "Neural Architecture Search (NAS)", level: "Advanced" },
      { id: "aml-4", title: "Meta-Learning", level: "Advanced" },
    ]
  },
  federated: {
    id: "federated",
    title: "Federated Learning",
    icon: "Shield",
    color: "from-accent-blue to-accent-peach",
    chapters: [
      { id: "fed-1", title: "Privacy-Preserving ML", level: "Basic" },
      { id: "fed-2", title: "Federated Averaging (FedAvg)", level: "Intermediate" },
      { id: "fed-3", title: "Differential Privacy", level: "Advanced" },
      { id: "fed-4", title: "Secure Multi-Party Computation", level: "Advanced" },
    ]
  },
  healthcare: {
    id: "healthcare",
    title: "AI in Healthcare",
    icon: "Heart",
    color: "from-accent-peach to-accent-orange",
    chapters: [
      { id: "hc-1", title: "Medical Imaging (MRI/CT)", level: "Basic" },
      { id: "hc-2", title: "EHR & Clinical Notes", level: "Intermediate" },
      { id: "hc-3", title: "Drug Discovery with AI", level: "Advanced" },
      { id: "hc-4", title: "Regulatory & Ethics in MedTech", level: "Advanced" },
    ]
  },
  finance: {
    id: "finance",
    title: "AI in Finance",
    icon: "TrendingUp",
    color: "from-accent-brown to-accent-orange",
    chapters: [
      { id: "fin-1", title: "Algorithmic Trading Basics", level: "Basic" },
      { id: "fin-2", title: "Fraud Detection Systems", level: "Intermediate" },
      { id: "fin-3", title: "Risk Modeling", level: "Advanced" },
      { id: "fin-4", title: "Reinforcement Learning in Trading", level: "Advanced" },
    ]
  },
  cloud: {
    id: "cloud",
    title: "Cloud ML Pipelines",
    icon: "Cloud",
    color: "from-accent-blue to-accent-brown",
    chapters: [
      { id: "cld-1", title: "AWS SageMaker", level: "Basic" },
      { id: "cld-2", title: "Google Vertex AI", level: "Intermediate" },
      { id: "cld-3", title: "Azure Machine Learning", level: "Advanced" },
      { id: "cld-4", title: "Serverless Inference", level: "Advanced" },
    ]
  },
  cpp: {
    id: "cpp",
    title: "C++ for High-Performance ML",
    icon: "Code2",
    color: "from-accent-orange to-accent-brown",
    chapters: [
      { id: "cpp-1", title: "Modern C++ Basics", level: "Basic" },
      { id: "cpp-2", title: "Memory Management & Pointers", level: "Intermediate" },
      { id: "cpp-3", title: "CUDA & GPU Programming", level: "Advanced" },
      { id: "cpp-4", title: "Writing Custom PyTorch Extensions", level: "Advanced" },
    ]
  },
  jax: {
    id: "jax",
    title: "Advanced Deep Learning with JAX",
    icon: "Zap",
    color: "from-accent-blue to-accent-peach",
    chapters: [
      { id: "jax-1", title: "JAX Arrays & Transformations", level: "Basic" },
      { id: "jax-2", title: "Autograd & vmap", level: "Intermediate" },
      { id: "jax-3", title: "Flax Neural Networks", level: "Advanced" },
      { id: "jax-4", title: "Scaling JAX on TPUs", level: "Advanced" },
    ]
  },
  optimization: {
    id: "optimization",
    title: "Convex Optimization",
    icon: "Target",
    color: "from-accent-peach to-accent-orange",
    chapters: [
      { id: "opt-1", title: "Convex Sets & Functions", level: "Basic" },
      { id: "opt-2", title: "Gradient Descent & Variants", level: "Intermediate" },
      { id: "opt-3", title: "Newton's Method", level: "Advanced" },
      { id: "opt-4", title: "Duality & KKT Conditions", level: "Advanced" },
    ]
  },
  quantum: {
    id: "quantum",
    title: "Quantum Machine Learning",
    icon: "Atom",
    color: "from-accent-brown to-accent-orange",
    chapters: [
      { id: "qml-1", title: "Quantum Computing Basics", level: "Basic" },
      { id: "qml-2", title: "Quantum Circuits & Qubits", level: "Intermediate" },
      { id: "qml-3", title: "Variational Quantum Algorithms", level: "Advanced" },
      { id: "qml-4", title: "Quantum Neural Networks", level: "Advanced" },
    ]
  },
};
