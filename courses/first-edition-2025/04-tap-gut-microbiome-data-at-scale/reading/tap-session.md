# Integrating human gut microbiome data at scale: from individuals to multi-layered features in clinical and nutritional studies

**Speaker:** Julien Tap, INRAE (France)

**Session 4** of the first edition of the School of Artificial Intelligence Applied to Microbiomes: Wednesday 1 October 2025, 15:45–17:45. The 2025 site spells the name Julian; the slides and the speaker's own site spell it Julien.

## Summary

*The 2025 programme published no abstracts. This summary was written for the archive from the slides.*

The number of samples in a human gut microbiome study has grown a hundredfold every ten years, from the first human gut catalogue (n = 124, Suau et al. 1999) to analyses of more than 35,000 samples. Every step from sample to features (collection, extraction, amplification, sequencing, then assembly, binning or database search) can bias the result, and the statistics that follow have no standard. Benchmarks find that relative abundances with nonparametric tests, log-transformed abundances with linear models, or presence and absence with logistic regression do at least as well as compositionally aware transformations. Analysed together, 35,000 gut microbiome samples are structured as branches rather than as separate enterotypes, with low-diversity branch tips that show functional shifts, transitions between states over time, and associations with region of birth, lifestyle, diet and recovery after surgery; a pseudo-time along the branches raises the question of whether diversity is already being lost from one generation to the next. The last part combines time series and meta-omics from a dietary fibre challenge study, and shows that strains from fermented foods are active in the gut.

## What the session covered

The session was a talk without a hands-on part.

1. The growth of gut microbiome studies, and the challenges of features that multiply and must be organised and combined with clinical and external metadata.
2. The metagenomic pipeline, from sample to reads to features, and where each step can introduce bias ("garbage in, garbage out").
3. Statistical analysis: benchmarks of differential abundance methods, gene richness, biomarkers from machine learning, and functional modules.
4. The factors that shape the gut microbiome over a lifetime, and microbiome states, resilience and alternative stable states.
5. The branched structure of 35,000 human gut microbiome samples (PHATE embedding and Dirichlet multinomial mixtures), its dynamics, and its associations with host and environment (Tap et al., Nature Communications 2023).
6. Multi-table methods (K-tables, paired tables, co-inertia analysis with the R package ade4) that link composition, metabolites and metatranscriptomics in a fibre challenge study, and fermented food strains in the gut.

## Setup

Nothing to install: the session had no code. The slides name the tools it used, among them the R packages phateR, DirichletMultinomial, ade4 and nnet, and SIAMCAT.

## Original material

- The session's page on the 2025 site: [presentation](https://ai-microbiome-school.onrender.com/docs/Julian-Tap/Presentation).
