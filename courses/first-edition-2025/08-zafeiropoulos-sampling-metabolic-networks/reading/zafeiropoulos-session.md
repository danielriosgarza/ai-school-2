# Sampling the solution space of metabolic networks

**Speaker:** Haris Zafeiropoulos, KU Leuven (Belgium)

**Session 8** of the first edition of the School of Artificial Intelligence Applied to Microbiomes: Thursday 2 October 2025, 15:45–17:45, a talk alternating with a notebook run in a GitHub codespace. The slides are titled *Sampling from the Solution Space and Metabolic Environments of Genome-Scale Metabolic Models*.

## Summary

*The 2025 programme published no abstracts. This summary was written for the archive from the slides.*

Genome-scale metabolic models support reverse ecology: from a genome, describe the growth medium of an organism, predict its interactions with other microbes, and find the pathways it uses in different conditions. Flux balance analysis (FBA) finds one flux distribution that optimises an objective such as growth. That makes it a biased method: it needs an objective function, its optimum is often not unique, and real cells may run suboptimally. Unbiased methods enumerate or sample the whole space of steady states instead. The steady-state constraints define a convex polytope, and uniform random flux sampling explores it with Markov chain Monte Carlo methods such as artificial centering hit-and-run (ACHR) and coordinate hit-and-run with rounding (CHRR), which the Python package dingo implements for high-dimensional models. The talk covers loopless and non-convex sampling, how to judge a sampling run (effective sample size, convergence), minimal pathways as a bridge between enumeration and sampling, and how the samples, a dataset in their own right, can be analysed with statistics such as copulas between pairs of fluxes.

## What the session covered

The hands-on part followed the notebook `flux_sampling.ipynb` on the `ai-school25` branch of the metabolic_toy_model repository, which each participant opened in a GitHub codespace. The tasks on the slides:

1. Choose a species, solve an FBA, choose a sampler and a solver and sample, then compare the uptake and secretion vectors of FBA with those of the sampling.
2. On a copy of the model, edit the medium by raising or lowering the bounds of sets of exchange reactions, sample again and compare with the original case.
3. Use dingo to sample suboptimal cases and compare them with the original case.
4. A final task: choose a species and compute its minimal pathways with mptool.

## Setup

The tutorial notebook is not part of this archive: it lives on its own branch, with the environment its codespace sets up. To run it, fork or open the repository, switch to the branch `ai-school25`, and create a codespace on that branch (Code, then Codespaces, then Create codespace on ai-school25). In the notebook, choose the global Python environment that the codespace suggests.

## Original material

- The session's page on the 2025 site: [information](https://ai-microbiome-school.onrender.com/docs/Haris-Zafeiropoulos/information).
- The slides in [Google Slides](https://docs.google.com/presentation/d/1yb8Z7gJ9TlJwT6GnS1KUQdNy_IWb3ZIxMUUMeNmO_KM/edit?usp=sharing); the PDF of this topic is an export of them.
- The tutorial: the [ai-school25 branch](https://github.com/hariszaf/metabolic_toy_model/tree/ai-school25) of metabolic_toy_model, and its notebook [flux_sampling.ipynb](https://github.com/hariszaf/metabolic_toy_model/blob/ai-school25/flux_sampling.ipynb).
- dingo, the sampling package: <https://github.com/GeomScale/dingo>.
