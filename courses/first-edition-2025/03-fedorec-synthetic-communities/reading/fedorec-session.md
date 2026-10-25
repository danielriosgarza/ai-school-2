# Computational design of synthetic microbial communities

**Speaker:** Alex Fedorec, University College London (UK)

**Session 3** of the first edition of the School of Artificial Intelligence Applied to Microbiomes: Wednesday 1 October 2025, 13:30–15:30, a talk followed by a four-part tutorial in notebooks.

## Summary

*The 2025 programme published no abstracts. This summary was written for the archive from the slides.*

Microbes are nearly everywhere, which makes them a powerful tool for engineering, but it also means that an engineered strain meets competition wherever it goes, and even alone it has limits. Synthetic communities, in which engineered strains share the work, are one answer. The talk surveys synthetic microbial ecology through cell-environment interactions (reinforcement learning control of co-cultures), spatial organisation (computational biofilms) and cell-cell interactions, which synthetic biology can now engineer to build new communities. The design space grows quickly: two strains with one extracellular molecule and one signal already give 15 distinct topologies. Approximate Bayesian computation (ABC) explores it by sampling a model and its parameters, simulating them, and keeping those that come close to the wanted behaviour, which yields posterior probabilities for both the models and their parameters. The same approach finds rare behaviours, such as chaos in generalized Lotka–Volterra communities, and the routes from oscillation to chaos and back to stability.

## Notebooks

- **Part 1: models of microbial communities** (`part1_community_models.ipynb`): growth and loss, logistic growth, competition and the generalized Lotka–Volterra model, the size of the design space, and a first ABC algorithm written by hand.
- **Part 2: designing a community with ABC rejection** (`part2_glv_abc_rejection.ipynb`): fits the parameters of a generalized Lotka–Volterra community to a wanted behaviour, stable coexistence at chosen population levels, with the ABC rejection algorithm.
- **Part 3: ABC-SMC with pyABC** (`part3_glv_abc_smc.ipynb`): the same problem with sequential Monte Carlo ABC, which lowers the acceptance threshold step by step and needs far fewer simulations.
- **Part 4: comparing community designs by model selection** (`part4_glv_model_selection_abc_smc.ipynb`): removes interactions from the model to make competing designs, and compares them by their posterior probabilities and Bayes factors.

The notes *Model selection with ABC*, by Alex Fedorec, give the mathematics behind parts 2 to 4.

## Setup

Each notebook has a folder of the same name beside it with its `requirements.txt`. In that folder, with Python 3.11 to 3.13:

```
pip install -r requirements.txt
```

Parts 3 and 4 use pyABC, which runs its samplers in parallel processes and writes its results to a small SQLite database in the working folder.

The pinned versions, with which the saved outputs were produced on Python 3.13: numpy 2.4.6, pandas 3.1.0, matplotlib 3.11.2 and seaborn 0.13.2 in all four parts; scipy 1.17.1 and networkx 3.6.1 in part 1; scipy 1.16.3 and IPython 9.17.1 in parts 2 to 4, with pyABC 0.13.0 in parts 3 and 4 and networkx 3.6.1 in part 4. Parts 2 to 4 keep scipy 1.16: with scipy 1.17.1 the LSODA solver hangs on some of the diverging communities these notebooks sample.

## Original material

- The session's page on the 2025 site: [presentation](https://ai-microbiome-school.onrender.com/docs/Alex-Fedorec/Presentation).
- The notebooks and the notes in the [AiSchool repository](https://github.com/danielriosgarza/AiSchool/tree/32e244d99335d12d930cf24ee005f97776f2655f/content/AlexFedorec).
