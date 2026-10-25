# Controlling complex microbiomes with computational intelligence: physical and virtual prototypes

**Speaker:** Daniel Garza, University of Paris Saclay, INRAE (France)

**Session 1** of the first edition of the School of Artificial Intelligence Applied to Microbiomes: Wednesday 1 October 2025, 09:30–10:15. The talk ended with a practical task, continued in the three notebooks of this topic.

## Summary

*The 2025 programme published no abstracts. This summary was written for the archive from the slides.*

Microbiome engineering is the rational control of a microbial ecosystem so that a wanted collective function emerges and persists. Two problems stand in the way. Microbiomes are hard to predict: their interactions emerge from local, context-specific dynamics, so the fixed and identifiable parameters of classical models such as the generalized Lotka–Volterra equations do not hold. And complex systems need different control principles: a reactor set once to "optimal" conditions drifts as the community changes. The talk names two missing ingredients, feedback control seen from the microbiome's side (sense the community, act on it, keep it on course) and computational intelligence, an agent that learns to reach a goal in many environments. It shows a prototype that couples trained agents with living microbiomes, and a kinetic model (a reactor, a microbiome of subpopulations, a metabolome) of three gut bacteria: *Bacteroides thetaiotaomicron*, *Blautia hydrogenotrophica* and *Roseburia intestinalis*. A reinforcement learning controller with four actuators (continuous feed, periodic feed, stirring and temperature) produces more butyrate than an open-loop controller. Its strategy keeps a small population of the acetogen on trehalose, so that it does not compete for glucose and pyruvate and its acetate feeds the butyrate producer.

## Notebooks

- **Kinetic model of a microbial community** (`kinetic_model.ipynb`): builds a model piece by piece (metabolites, feeding terms, subpopulations, bacteria, environment, a control pulse and a reactor), simulates it, then loads the three-species gut community from `modelTemplates/`. Its network views are ipycytoscape widgets, which appear in JupyterLab or Jupyter Notebook but not on the course page.
- **Butyrate control: random actions** (`controller_simulation_demo.ipynb`): runs one episode of the butyrate control environment with random actions and plots the target, the actions and the kinetics.
- **Butyrate control: a trained controller** (`compare_control_policies.ipynb`): the same episode driven by the trained controller (a PPO policy from the repository's `trained_models/`), to compare with the random one.

## Setup

Each notebook has a folder of the same name beside it, with its data files and a `requirements.txt`. In that folder, with Python 3.11 to 3.13 and git installed:

```
pip install -r requirements.txt
```

The requirements install Daniel Garza's packages `kinetic_model` and `rl` from GitHub, from the AiSchool repository at the commit of 2 October 2025:

```
pip install "daniel-garza-microbiome @ git+https://github.com/danielriosgarza/AiSchool.git@32e244d99335d12d930cf24ee005f97776f2655f#subdirectory=content/DanielGarza"
```

The kinetic model notebook draws its plotly figures as PNG images with kaleido, which needs Chrome or Chromium on the computer.

The pinned versions, with which the saved outputs were produced on Python 3.13: for `kinetic_model`, plotly 7.1.0, kaleido 1.5.0, ipycytoscape 1.3.3 and ipywidgets 8.1.9; for the two controller notebooks, numpy 2.4.6, PyYAML 6.0.3, stable-baselines3 2.9.0 and matplotlib 3.11.2; all three with Daniel Garza's packages from the commit above.

## Original material

- The session's pages on the 2025 site: [presentation](https://ai-microbiome-school.onrender.com/docs/Daniel-Garza/Presentation), [kinetic microbiome model](https://ai-microbiome-school.onrender.com/docs/Daniel-Garza/Kinetic%20Microbiome%20Model) and [microbiome controller](https://ai-microbiome-school.onrender.com/docs/Daniel-Garza/Microbiome%20Controller).
- The notebooks, the packages and the trained models in the [AiSchool repository](https://github.com/danielriosgarza/AiSchool/tree/32e244d99335d12d930cf24ee005f97776f2655f/content/DanielGarza).
- The notebooks as the 2025 site linked them, in the [microbesGYM repository](https://github.com/danielriosgarza/microbesGYM).
