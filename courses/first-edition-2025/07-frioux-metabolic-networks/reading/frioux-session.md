# Metabolic network reconstruction and modelling: from the individual to the community

**Speaker:** Clémence Frioux, Inria, University of Bordeaux (France)

**Session 7** of the first edition of the School of Artificial Intelligence Applied to Microbiomes: Thursday 2 October 2025, 13:30–15:30, an introduction followed by a hands-on tutorial.

## Summary

*The 2025 programme published no abstracts. This summary was written for the archive from the slides.*

Many interactions in microbial ecosystems are mediated by metabolism, so modelling the diversity, interactions and functions of a community starts with metabolic networks. A genome encodes 1,000 to 5,000 reactions, which a genome-scale metabolic network abstracts from the structural and functional annotation of the sequence. Such networks are reconstructed bottom-up, by automatic inference with tools such as gapseq or Pathway Tools followed by guided curation, or top-down from a curated universal model. Constraint-based modelling and flux balance analysis need a metabolic objective, stoichiometry and curated networks, which non-model organisms, metagenome-assembled genomes and large communities rarely offer. Discrete models offer an alternative: network expansion computes the scope of metabolites a network can produce from given nutrients (seeds), ignoring stoichiometry and needing no objective, and Answer Set Programming implements it and its extensions. Applied to communities, as in MeneTools and Metage2Metabo, the scope shows which compounds only a community can produce through cooperation, and which minimal communities and key species produce the compounds of interest.

## What the session covered

The hands-on part followed Clémence Frioux's public tutorial, [EBAME tutorial on metabolic network reconstruction and modelling](https://gitlab.inria.fr/cfrioux/ebame). In 2025 the participants ran it on a shared computing cluster, in conda environments prepared for the school. Its steps:

1. Manipulating metabolic models with [Fluxer](https://fluxer.umbc.edu/), and a closer look at a metabolic network in the SBML exchange format.
2. Metabolic network reconstruction: structural annotation with Prodigal, reconstruction with gapseq from protein sequences or with kegg2bipartite from protein annotations, and networks reconstructed with Pathway Tools.
3. Modelling the metabolism of one species, on toy data and on real networks.
4. Screening the metabolism of microbial communities, on toy and on realistic communities.
5. A bonus: inferring the seed metabolites (nutrients) from a metabolic network.

To try Answer Set Programming, paste this toy network into the [clingo online solver](https://potassco.org/clingo/run/). It computes the scope of the seeds A and C: the metabolites that the reactions r1 and r2 can produce from them.

```
reaction("r1").
reactant("A", "r1").
product("B", "r1").

reaction("r2").
reactant("B", "r2").
reactant("C", "r2").
product("D", "r2").

seed("A").
seed("C").

scope(M) :- seed(M).
scope(M) :- product(M,R); reaction(R); scope(N) : reactant(N,R).

#show scope/1.
```

## Setup

The tutorial has no notebook. Clone its repository and create its conda environments as its README describes:

```
git clone https://gitlab.inria.fr/cfrioux/ebame.git
conda create -c conda-forge -c bioconda -y -n ebame_metabo_gapseq gapseq
conda env create -f ebame/conda/ebame_metabo_reasoning.yml
conda env create -f ebame/conda/ebame_metabo_memote.yml
```

The README then clones gapseq and downloads its reference data. Most steps use the environment `ebame_metabo_reasoning`.

## Original material

- The session's pages on the 2025 site: [presentation](https://ai-microbiome-school.onrender.com/docs/Clemence-Frioux/Presentation) and [tutorial notes](https://ai-microbiome-school.onrender.com/docs/Clemence-Frioux/tutorial).
- The tutorial: <https://gitlab.inria.fr/cfrioux/ebame>.
