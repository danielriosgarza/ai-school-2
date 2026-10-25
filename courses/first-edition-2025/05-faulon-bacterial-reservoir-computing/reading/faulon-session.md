# Bacterial reservoir computing

**Speaker:** Jean-Loup Faulon, University of Paris Saclay, INRAE (France)

**Session 5** of the first edition of the School of Artificial Intelligence Applied to Microbiomes: Thursday 2 October 2025, 09:30–10:15.

## Summary

*The 2025 programme published no abstracts. This summary was written for the archive from the slides.*

A trained perceptron can diagnose a disease from the concentrations of a panel of metabolites, but only after those concentrations have been measured. Could a living or cell-free system compute the answer directly on a clinical sample? The talk starts from metabolic perceptrons built in vitro, where enzyme concentrations set the weights and a transcription factor driving a reporter acts as the activation function. It then asks whether the native metabolism of *E. coli* can serve as a reservoir computer, a physical system whose response to its inputs a trained read-out layer turns into answers. Genome-scale metabolic models solved by flux balance analysis predict measured growth rates poorly and cannot pass gradients, so artificial metabolic networks, neural networks that respect the model's constraints, replace them and make the mechanistic reservoir trainable. With living *E. coli* as the reservoir (nutrients as the input, growth as the phenotype, a neural network as the read-out), the approach solves regression problems from OpenML about as well as standard machine learning, and its capacity across ten organisms follows the diversity of their metabolic phenotypes. Grown on the plasma of Covid-19 patients, the bacteria tell severe from moderate outcomes from their growth curves, with a cross-validated accuracy of 0.84.

## What the session covered

The session was a talk without a hands-on part.

1. Engineering biological information processing: perceptrons for diagnosis, and metabolic perceptrons built in vitro (Pandi, Koch et al., Nature Communications 2019).
2. Reservoir computing, the use of a physical, chemical or biological system to solve problems, and the question of whether *E. coli* metabolism can be such a reservoir.
3. Genome-scale metabolic models and flux balance analysis as a conventional reservoir, and their limits.
4. Artificial metabolic networks that make flux balance analysis compatible with gradient backpropagation (Faure et al., Nature Communications 2023), trained on growth rates measured in hundreds of media.
5. *E. coli* as a physical reservoir: regression problems from OpenML, the link between a reservoir's capacity and the diversity of its phenotypes, and the classification of Covid-19 patients by disease outcome from bacterial growth curves in their plasma (Ahavi et al., bioRxiv 2025).

## Setup

Nothing to install: the session had no code.

## Original material

- The session's page on the 2025 site: [presentation](https://ai-microbiome-school.onrender.com/docs/Jean-Loup-Faulon/Presentation).
