# Simulation and control of high-dimensional dynamical systems using artificial neural networks

**Speaker:** Lucas Böttcher, Frankfurt School of Finance & Management (Germany)

**Session 6** of the first edition of the School of Artificial Intelligence Applied to Microbiomes: Thursday 2 October 2025, 10:30–12:30, a talk followed by a notebook tutorial.

## Summary

*The 2025 programme published no abstracts. This summary was written for the archive from the slides.*

A neural network can stand in for the right-hand side of an ordinary differential equation: trained on observations through a numerical integrator (an Euler or Runge–Kutta cell), it learns the dynamics of the system, which is the idea of neural ODEs. Control is the next step. Classical optimal control, through Pontryagin's maximum principle or the Hamilton–Jacobi–Bellman equation, becomes hard for high-dimensional and stochastic systems. A neural ODE controller instead represents the control signal by a neural network and trains it through the simulated dynamics, and it comes close to the optimal solutions. The talk applies this to the intestinal microbiota: a generalized Lotka–Volterra model of eleven species with antibiotic susceptibilities (Jones and Carlson, PLOS Computational Biology 2018) describes how clindamycin opens the way to *Clostridium difficile* (*C. difficile*). A neural controller learns an antibiotic schedule that suppresses *C. difficile* while using as little antibiotic as possible.

## Notebooks

- **Lecture notebook** (`microbial_control.ipynb`): the generalized Lotka–Volterra model with control, a neural network for the antibiotic dose, the loss that weighs *C. difficile* against the total dose, training through `torchdiffeq`, and the plots of the control signal and of the controlled and uncontrolled trajectories.
- **Exercises** (`microbial_control_exercises.ipynb`): the same notebook with the forward dynamics, the training loop and the controller's forward pass left as `# TODO`. Its saved outputs show the `NotImplementedError` each unfilled step raises.
- **Solutions** (`microbial_control_solutions.ipynb`): the exercises filled in, with their outputs.

The PDF readings are the lecture notes *Control of dynamical systems with neural networks* (the version of 13 October 2025 from the 2025 site) and the lecture notebook as a PDF.

## Reading list

- Böttcher, L., Antulov-Fantulin, N. and Asikis, T., 2022. AI Pontryagin or how artificial neural networks learn to control dynamical systems. *Nature Communications*, 13(1), p.333.
- Asikis, T., Böttcher, L. and Antulov-Fantulin, N., 2022. Neural ordinary differential equation control of dynamics on graphs. *Physical Review Research*, 4(1), p.013221.
- Böttcher, L. and Asikis, T., 2022. Near-optimal control of dynamical systems with neural ordinary differential equations. *Machine Learning: Science and Technology*, 3(4), p.045004.

## Setup

Each notebook has a folder of the same name beside it with its `requirements.txt`. In that folder, with Python 3.11 to 3.13:

```
pip install -r requirements.txt
```

This installs PyTorch. On a computer without a GPU, the CPU build is much smaller:

```
pip install torch==2.14.1 --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
```

The pinned versions, the same for the three notebooks, with which the saved outputs were produced on Python 3.13: numpy 2.4.6, torch 2.14.1, torchdiffeq 0.2.5 and matplotlib 3.11.2. Training in the lecture and solutions notebooks took about two and a half minutes each when they were executed for this archive, on a processor without a GPU.

## Original material

- The session's pages on the 2025 site: [presentation](https://ai-microbiome-school.onrender.com/docs/Lucas-Bottcher/Presentation), [reading list](https://ai-microbiome-school.onrender.com/docs/Lucas-Bottcher/reading-list), [lecture notes](https://ai-microbiome-school.onrender.com/docs/Lucas-Bottcher/ANN%20Control) and [practical notebook](https://ai-microbiome-school.onrender.com/docs/Lucas-Bottcher/Microbial%20control).
- The notebooks (with a Colab version) and the PDFs in the [AiSchool repository](https://github.com/danielriosgarza/AiSchool/tree/32e244d99335d12d930cf24ee005f97776f2655f/content/LucasBottcher).
