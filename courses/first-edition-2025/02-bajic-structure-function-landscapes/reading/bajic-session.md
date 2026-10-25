# Statistical mapping of structure-function landscapes in microbiomes

**Speaker:** Djordje Bajić, TU Delft (Netherlands)

**Session 2** of the first edition of the School of Artificial Intelligence Applied to Microbiomes: Wednesday 1 October 2025, 10:30–12:30, a talk followed by an R tutorial.

## Summary

*The 2025 programme published no abstracts. This summary was written for the archive from the slides.*

Of all the species one could put together, which combination maximizes a function such as ethanol production or a plant's growth? The talk carries the fitness landscape, the map from genotype to fitness that explains how populations climb towards fitter genotypes, over to communities: a structure-function landscape maps the composition of a synthetic community to its function. Like fitness landscapes, these landscapes are shaped by interactions (epistasis), and testing all 2^N combinations of N species is infeasible, so the function of most consortia has to be predicted from a few measurements. Linear regression on the presence and absence of species already works quite well, and machine learning can do more. Global epistasis, a linear scaling found in many fitness landscapes between the effect of adding a component and the function of the background it is added to, also holds in ecological structure-function landscapes (Diaz-Colunga, Skwara et al., Cell 2024). It predicts, for instance, pyoverdine production and the acidification of soy milk by fermenting communities.

## What the session covered

The talk set three goals: know what a structure-function landscape is, know what global epistasis is and why it is useful, and run some machine learning code to make predictions. In the tutorial, written by Juan Díaz-Colunga, participants take a complete data set of all 256 combinations of 8 species, keep 30 consortia as the measured sample, predict the function of the other 226 with a method of their choice, and judge the method by how close the true function of its predicted best consortium comes to the true maximum. The tutorial and its exercise slides are the other two readings of this topic.

## Setup

The tutorial is in R, not Python, so this topic has no notebook. Install R and the package ggplot2:

```
install.packages("ggplot2")
```

Then download the tutorial folder from the AiSchool repository and run the code from its `tutorials/` folder, so that the data path `../data/full-factorial-construction_Diaz-Colunga2024.csv` resolves. The other methods in `scripts/models.R` and `scripts/aux_functions.R` use further packages (glmnet, rsparse, Matrix, ranger, xgboost, kernlab, nnet, nnls, dplyr, tidyr, ggforce, combinat, rmarkdown), each loaded at the top of the script.

## Original material

- The session's pages on the 2025 site: [presentation](https://ai-microbiome-school.onrender.com/docs/Djordje-Bajic/Presentation) and [exercises](https://ai-microbiome-school.onrender.com/docs/Djordje-Bajic/Exercises).
- The tutorial (R Markdown and knitted HTML), the scripts and the data in the [AiSchool repository](https://github.com/danielriosgarza/AiSchool/tree/32e244d99335d12d930cf24ee005f97776f2655f/content/DjordjeBajic).
